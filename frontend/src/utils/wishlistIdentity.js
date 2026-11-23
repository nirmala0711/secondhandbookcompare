const text = (value) => String(value || '').trim().toLowerCase();

export function getBookListingIdentity(book) {
  if (!book) return '';

  const rawId = book.bookId || book.id;
  const sourceId = rawId && !String(rawId).startsWith('wish-')
    ? String(rawId)
    : '';
  if (sourceId) return `id:${sourceId}`;

  return [
    'listing',
    text(book.title),
    text(book.author),
    text(book.website),
    text(book.isbn),
    text(book.edition),
    text(book.condition),
    text(book.price),
  ].join('|');
}

export function isSameWishlistItem(left, right) {
  if (!left || !right) return false;

  const leftId = left.bookId || left.id;
  const rightId = right.bookId || right.id;

  if (leftId && rightId) return String(leftId) === String(rightId);

  return getBookListingIdentity(left) === getBookListingIdentity(right);
}
