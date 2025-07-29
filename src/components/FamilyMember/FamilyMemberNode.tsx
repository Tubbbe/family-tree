import {Handle} from "@xyflow/react";
import {FamilyMember, FamilyMemberBirthDeath, FamilyMemberContent, FamilyMemberName} from "./style";

export function FamilyMemberNode(props: any) {
    return (
        <FamilyMember>
            <Handle type="target" position={props.targetPosition} />
            <FamilyMemberContent>
                <FamilyMemberName>{props.data.givenName + " " + props.data.surname.toUpperCase()}</FamilyMemberName>
                <FamilyMemberBirthDeath>{props.data.born ? props.data.born : "????"}{props.data.death ? ` - ${props.data.death}` : ""}</FamilyMemberBirthDeath>
            </FamilyMemberContent>
            <Handle type="source" position={props.sourcePosition} />
        </FamilyMember>
    );
}
