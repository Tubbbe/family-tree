import {FamilyMember} from "./style";

export function FamilyMemberNode(props: any) {
    return (
        <FamilyMember>
            {props.data.label}
        </FamilyMember>
    );
}
