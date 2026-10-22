/**
 * `node-fetch` stub.
 *
 * `seqparse` only reaches `node-fetch` when an NCBI / iGEM accession is parsed
 * instead of a file. This viewer never parses accessions, and the module must
 * not drag a Node HTTP stack into the browser bundle, so the dependency is
 * replaced with a stub that explains itself if it is ever called.
 */

export default function fetchUnavailable() {
  throw new Error('dsh-gene: network accession fetching is not available in the Sidebar viewer')
}

export const Headers = class Headers {}
export const Request = class Request {}
export const Response = class Response {}
