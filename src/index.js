/**
 * dsh-gene — host half.
 *
 * The viewer is entirely browser side: it registers a document renderer for the
 * right Sidebar's file preview (`sidebar.right.tab.document`) through
 * `ctx.documentPreviews`, and parses the file bytes in the Web page with
 * `seqparse` before handing them to `SeqViz`. Nothing here touches the Host
 * filesystem, so the only job of this half is to exist: the Loader enables the
 * package and composes its `dsh.client` half into the page.
 */

export const name = 'dsh-gene'

export function apply(ctx) {
  ctx.logger?.info?.('[dsh-gene] SeqViz sequence viewer registered for the right Sidebar')
}
