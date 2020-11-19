const debug = require('./debug.js')

const checkTree = tree => {
  // this can only happen in tests where we have a "tree" object
  // that isn't actually a tree.
  if (!tree.root || !tree.root.inventory)
    return tree
  const { inventory } = tree.root
  const seen = new Set()
  const check = node => {
    if (seen.has(node))
      return
    if (node.isRoot && node !== tree.root) {
      throw Object.assign(new Error('double root'), {
        path: node.path,
        realpath: node.realpath,
        location: node.location,
      })
    }
    if (!node.isRoot && !inventory.has(node)) {
      throw Object.assign(new Error('not in inventory'), {
        path: node.path,
        realpath: node.realpath,
        location: node.location,
        root: node.root.path,
      })
    }
    const { parent, fsParent, target } = node
    seen.add(node)
    if (parent && !seen.has(parent))
      check(parent)
    if (fsParent && !seen.has(fsParent))
      check(fsParent)
    if (target && !seen.has(target))
      check(target)
    for (const kid of node.children.values())
      check(kid)
    for (const kid of node.fsChildren)
      check(kid)
    for (const link of node.linksIn)
      check(link)
  }
  check(tree)
  for (const node of inventory.values()) {
    if (!seen.has(node)) {
      throw Object.assign(new Error('unreachable in inventory'), {
        path: node.path,
        realpath: node.realpath,
        location: node.location,
      })
    }
  }
  return tree
}

// should only ever run this check in debug mode
module.exports = tree => tree
debug(() => module.exports = checkTree)
