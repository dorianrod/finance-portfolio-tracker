import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
const require = createRequire(new URL('../../../packages/dashboard/package.json', import.meta.url))
const ts = require('typescript')
const root = resolve(import.meta.dirname, '../../..')
const audit = JSON.parse(readFileSync(new URL('./run.json',import.meta.url),'utf8'))
const paths = new Set(audit.files.filter(f=>f.present).map(f=>f.path))
const result=[]
const exported = node => node.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)
function resolveTarget(from, target) {
 let base
 if(target.startsWith('@/')) base='packages/dashboard/src/'+target.slice(2)
 else if(target.startsWith('.'))base=relative(root,resolve(root,dirname(from),target))
 else return null
 return [base,base+'.ts',base+'.tsx',base+'.js',base+'.mjs',base+'/index.ts',base+'/index.tsx'].find(p=>paths.has(p))??base
}
for(const file of audit.files.filter(f=>f.present&&/\.[cm]?[jt]sx?$/.test(f.path))){
 const text=readFileSync(resolve(root,file.path),'utf8')
 const ast=ts.createSourceFile(file.path,text,ts.ScriptTarget.Latest,true)
 const entry={file:file.path,imports:[],exports:[],functions:[],types:[],atoms:[],suppressions:[]}
 const line=node=>ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1
 function visit(node,owner='module'){
  if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier)){
   entry.imports.push({target:node.moduleSpecifier.text,resolved:resolveTarget(file.path,node.moduleSpecifier.text),typeOnly:node.importClause?.isTypeOnly??node.isTypeOnly??false,line:line(node)})
  }
  if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))entry.imports.push({target:node.arguments[0].text,resolved:resolveTarget(file.path,node.arguments[0].text),dynamic:true,line:line(node)})
  if(ts.isFunctionDeclaration(node)||ts.isClassDeclaration(node)){
   if(exported(node))entry.exports.push(node.name?.text??'default')
  }
  if(ts.isVariableStatement(node)&&exported(node))for(const d of node.declarationList.declarations)entry.exports.push(d.name.getText(ast))
  if(ts.isTypeAliasDeclaration(node)||ts.isInterfaceDeclaration(node)||ts.isEnumDeclaration(node))entry.types.push({name:node.name.text,kind:ts.SyntaxKind[node.kind],public:!!exported(node),line:line(node),contract:node.getText(ast)})
  let current=owner
  if(ts.isFunctionDeclaration(node)||ts.isArrowFunction(node)||ts.isFunctionExpression(node)||ts.isMethodDeclaration(node)){
   current=node.name?.getText(ast)??(ts.isVariableDeclaration(node.parent)?node.parent.name.getText(ast):ts.isPropertyAssignment(node.parent)?node.parent.name.getText(ast):owner+':callback')
   entry.functions.push({name:current,line:line(node),parameters:node.parameters.map(p=>p.getText(ast)),returnType:node.type?.getText(ast)??null})
  }
  if(ts.isCallExpression(node)&&['atom','atomWithStorage'].includes(node.expression.getText(ast)))entry.atoms.push({name:ts.isVariableDeclaration(node.parent)?node.parent.name.getText(ast):current,line:line(node),declaration:node.getText(ast)})
  ts.forEachChild(node,child=>visit(child,current))
 }
 visit(ast)
 result.push(entry)
}
writeFileSync(new URL('./source-inventory.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
console.log(`Enumerated ${result.length} JS/TS files, ${result.reduce((n,f)=>n+f.imports.length,0)} import edges and ${result.reduce((n,f)=>n+f.types.length,0)} type declarations. No compliance results assigned.`)
for(const file of result.filter(f=>f.atoms.length&&!/test|storybook/.test(f.file))){
 console.log(file.file,JSON.stringify({atoms:file.atoms,consumers:result.filter(f=>f.imports.some(i=>i.resolved===file.file)).map(f=>f.file)}))
}
