import { basename } from 'node:path'

import {
  childrenOf,
  findVariable,
  isProductionSource,
  stableInitializer,
  unwrap,
} from './ast-bindings.js'
import { libraryBinding } from './library-binding.js'
import { isFunctionNode } from './react-component-utils.js'

const READS = new Set([
  'useQuery',
  'useSuspenseQuery',
  'useInfiniteQuery',
  'useSuspenseInfiniteQuery',
  'useQueries',
  'useSuspenseQueries',
])

export default {
  meta: {
    type: 'problem',
    docs: { description: 'Keep TanStack observers in intent-named API hooks' },
    schema: [],
    messages: {
      location:
        'Call {{hook}} only in the owning domain apis/{{folder}} hook. Cache-only observers belong there too. [api-wrap-in-domain-hooks]',
      name: 'Name this query hook useGet<Entity>[Aspect]Query and give its file the same name. Cache-only observers may use useCached<Entity>Query. [api-naming]',
      transition:
        'Choose an explicit placeholderData policy for a parameter-dependent query key: keep previous results when appropriate, or explicitly clear them with undefined. [api-query-hook-choice]',
    },
  },
  create(context) {
    if (!isProductionSource(context.filename)) return {}
    const filename = context.filename.replaceAll('\\', '/')
    const reported = new Set()
    function dependsOnParameters(input, owner, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (node.type === 'Identifier') {
        const variable = findVariable(context.sourceCode, node)
        if (
          variable?.defs.some(
            (definition) =>
              definition.type === 'Parameter' && definition.node === owner,
          )
        )
          return true
        return dependsOnParameters(
          stableInitializer(context.sourceCode, node),
          owner,
          seen,
        )
      }
      const children =
        node.type === 'MemberExpression' && !node.computed
          ? [node.object]
          : childrenOf(context.sourceCode, node)
      return children.some((child) => dependsOnParameters(child, owner, seen))
    }
    function isCacheObserver(input, seen = new Set()) {
      const node = unwrap(input)
      if (!node || seen.has(node)) return false
      seen.add(node)
      if (node?.type === 'ObjectExpression')
        return node.properties.some(
          (property) =>
            property.type === 'Property' &&
            (property.key.name ?? property.key.value) === 'queryFn' &&
            libraryBinding(
              context.sourceCode,
              property.value,
              '@tanstack/react-query',
            ) === 'skipToken',
        )
      return isCacheObserver(stableInitializer(context.sourceCode, node), seen)
    }
    return {
      CallExpression(node) {
        const hook = libraryBinding(
          context.sourceCode,
          node.callee,
          '@tanstack/react-query',
        )
        if (!READS.has(hook) && hook !== 'useMutation') return
        const folder = hook === 'useMutation' ? 'mutations' : 'queries'
        if (!new RegExp(`/domains/.+/apis/${folder}/`, 'u').test(filename)) {
          context.report({
            node,
            messageId: 'location',
            data: { hook, folder },
          })
          return
        }
        if (folder !== 'queries') return
        let owner = node.parent
        while (owner && !isFunctionNode(owner)) owner = owner.parent
        const name =
          owner?.id?.name ??
          (owner?.parent.type === 'VariableDeclarator'
            ? owner.parent.id.name
            : null)
        const cache = isCacheObserver(node.arguments[0])
        const options = unwrap(node.arguments[0])
        if (owner && options?.type === 'ObjectExpression') {
          const properties = options.properties.filter(
            (property) => property.type === 'Property',
          )
          const key = properties.find(
            (property) =>
              (property.key.name ?? property.key.value) === 'queryKey',
          )
          if (
            key &&
            dependsOnParameters(key.value, owner) &&
            !properties.some(
              (property) =>
                (property.key.name ?? property.key.value) === 'placeholderData',
            ) &&
            !options.properties.some(
              (property) => property.type === 'SpreadElement',
            )
          )
            context.report({ node: key, messageId: 'transition' })
        }
        if (
          (!/^useGet[A-Z]\w*Query$/u.test(name ?? '') &&
            !(cache && /^useCached[A-Z]\w*Query$/u.test(name ?? ''))) ||
          basename(filename).replace(/\.[cm]?[jt]sx?$/u, '') !== name
        ) {
          const target = owner ?? node
          if (!reported.has(target)) {
            reported.add(target)
            context.report({ node: target, messageId: 'name' })
          }
        }
      },
    }
  },
}
