import {IllustrationSlot} from "../illustration/IllustrationSlot";
export function ExperienceIntro({asset,title,description}:{asset:string;title:string;description:string}) {
 return <div className="im-intro"><IllustrationSlot slot={{path:`/brand/recursos/${asset}.webp`,ratio:"16:9",alt:"",brief:""}} decorative/><div><h2>{title}</h2><p>{description}</p></div></div>;
}
