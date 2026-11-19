interface UserPathTarget {
  id: string
  userName?: string | null
}

/** `/users/matheus-silva`; cai para o id se a pessoa ainda não tiver handle. */
export function userPath(user: UserPathTarget): string {
  const ref = user.userName || user.id
  return `/users/${encodeURIComponent(ref)}`
}
