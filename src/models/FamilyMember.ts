export interface FamilyMember {
    id: string;
    givenName: string;
    surname: string;
    gender: "M" | "F" | "NB" | undefined;
    born: number;
    death: number;
    bornCity: string | undefined;
    bornCountry: string | undefined;
    nationality: string | undefined;
    parents: string[] | undefined;
    adoptiveParents: string[] | undefined;
    children: string[] | undefined;
    spouses: string[] | undefined;
    divorced: string[] | undefined;
}