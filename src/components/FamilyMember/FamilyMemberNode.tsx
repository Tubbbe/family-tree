import {Handle, Position} from "@xyflow/react";
import {FamilyMember, FamilyMemberBirthDeath, FamilyMemberContent, FamilyMemberFlag, FamilyMemberName} from "./style";

export function FamilyMemberNode(props: any) {
    return (
        <FamilyMember $background={props.data.genderColor}>
            <Handle type="target" position={Position.Top} />
            <FamilyMemberContent>
                <p>{props.data.zoneId} / {props.data.xPosition}</p>
                {props.data.nationality ? <FamilyMemberFlag src={`https://flagsapi.com/${props.data.nationality}/shiny/64.png`}/> : null}
                <FamilyMemberName>{props.data.givenName + (props.data.surname ? " " + props.data.surname.toUpperCase() : "")}</FamilyMemberName>
                <FamilyMemberBirthDeath>{props.data.born ? props.data.born : "????"}{props.data.death ? ` - ${props.data.death}` : ""}</FamilyMemberBirthDeath>
            </FamilyMemberContent>
            <Handle type="source" position={Position.Bottom} />
        </FamilyMember>
    );
}
