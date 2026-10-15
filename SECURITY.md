# Security

Please report security problems privately, through
[GitHub's private vulnerability reporting](https://github.com/dwyfl/gmljs/security/advisories/new),
rather than in a public issue.

## Rendering untrusted documents

The parser rejects DTDs, so documents can't declare or expand entities. Canvas work for
a single arc or round join is bounded.

There are no general limits on document size, point count or output dimensions yet. If
you parse or render GML from untrusted sources, for example uploads on a server, limit the
input size and image dimensions yourself, and consider rendering in a worker or a
separate process with a timeout.
