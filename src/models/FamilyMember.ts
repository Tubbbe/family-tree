export interface FamilyMember {
    id: string;
    givenName: string;
    surname: string;
    born: number;
    death: number;
    bornCity: string | undefined;
    bornCountry: string | undefined;
    parents: string[] | undefined;
    adoptiveParents: string[] | undefined;
    children: string[] | undefined;
    spouses: string[] | undefined;
    divorced: string[] | undefined;
}