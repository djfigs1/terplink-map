export type ClubListing = {
    id: string,
    key: string,
    shortName: string | null,
    name: string,
    summary: string,
    description: string,
    status: string,
    categories: string[],
    totalMembers: number,
    icon?: string
}

export function getTerpLinkUrl(club: ClubListing): string {
    return getTerpLinkUrlWithKey(club.key)
}

export function getTerpLinkUrlWithKey(key: string) {
    return `https://terplink.umd.edu/organization/${key}`
}

export function openClubOnTerpLink(club: ClubListing) {
    openClubOnTerpLinkWithKey(club.key);
}

export function openClubOnTerpLinkWithKey(key: string) {
    let url = getTerpLinkUrlWithKey(key);
    window.open(url, '_blank')
}