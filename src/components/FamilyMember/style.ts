import styled from "styled-components";

export const FamilyMember = styled.div<{ $background?: string; }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px #777 solid;
    border-radius: 10px;
    background-color: ${props => props.$background || "white"};
`;

export const FamilyMemberContent = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 8px;
`;

export const FamilyMemberFlag = styled.img`
    width: 24px;
`;

export const FamilyMemberName = styled.span`
    
`;

export const FamilyMemberBirthDeath = styled.span`
    font-size: small;
    font-weight: 400;
`;