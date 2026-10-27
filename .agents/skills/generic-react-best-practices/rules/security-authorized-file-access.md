---
title: Read Protected Files Only Through the Authorized File Primitive
impact: HIGH
impactDescription: protected files load with the bearer token instead of failing or bypassing auth
tags: security, files, download, preview, protected-file
---

## Read Protected Files Only Through the Authorized File Primitive

**Impact: HIGH (protected files load with the bearer token instead of failing or bypassing auth)**

When the backend exposes files as relative protected routes that need a bearer token, a native navigation (`window.open(url)`, `<a href>`, `<iframe src>`, `<img src>`) resolves them against the frontend origin without the `Authorization` header, so they fail or tempt a workaround that bypasses auth. Open, preview and download them through one authenticated primitive of the app: fetch the file with the authenticated axios client (`responseType: 'blob'`), then work on the resulting blob or object URL. Domain code never builds its own fetch for a file.

| Need | Primitive built on the authenticated fetch |
| --- | --- |
| Preview an image or PDF | `useAuthorizedFileUrl(fileUrl)` returns `{ objectUrl, isLoading, error }` |
| Open in a new tab on click | `useOpenAuthorizedFile()` returns `(fileUrl) => Promise<void>` |
| Download one file | `downloadFile(fileUrl, { filename })` |

**Incorrect (relative backend route opened natively, no bearer):**

```tsx
<button onClick={() => window.open(attachment.fileUrl, '_blank')}>{attachment.fileName}</button>
<img src={attachment.previewUrl} alt={attachment.fileName} />
```

**Correct (single fetch-to-blob primitive, object URL revoked by its owner):**

```tsx
// shared/helpers/authorizedFile.ts
export const fetchAuthorizedBlob = async (fileUrl: string): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(fileUrl, { responseType: 'blob' })
  return data
}

export function useAuthorizedFileUrl(fileUrl: string) {
  const query = useQuery({
    queryKey: ['authorized-file', fileUrl],
    queryFn: () => fetchAuthorizedBlob(fileUrl),
  })
  const objectUrl = useMemo(() => (query.data ? URL.createObjectURL(query.data) : null), [query.data])
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }, [objectUrl])
  return { objectUrl, isLoading: query.isLoading, error: query.error }
}

// consumer
const { objectUrl } = useAuthorizedFileUrl(attachment.previewUrl)
return objectUrl && <img src={objectUrl} alt={attachment.fileName} />
```

- Never add a `window.open(relativeUrl)` fallback, even in a `catch`. Absolute `http(s)` URLs, including intentional external links, keep the native behavior (see `security-window-open-noopener`).
- The code that creates an object URL revokes it (on source change or unmount); never revoke a URL received from a caller.
- Open the new tab synchronously in the click handler, then set its location once the blob is ready, so popup blockers do not interfere.
