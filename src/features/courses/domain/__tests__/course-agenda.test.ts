import { courseAgendaSchema, repeatCourseSession } from "../course-agenda";
const first={id:"a",title:"Encontro",date:"2026-01-31",startTime:"09:00",endTime:"11:00"};
const agenda={timezone:"America/Sao_Paulo",modality:"online",startDate:"",endDate:"",sessions:[first]};
it("clamps monthly recurrences without drifting following months",()=>{expect(repeatCourseSession(first,3,"monthly").map(s=>s.date)).toEqual(["2026-01-31","2026-02-28","2026-03-31"]);});
it("rejects impossible dates, backwards times and overlapping meetings",()=>{
 expect(courseAgendaSchema.safeParse({...agenda,sessions:[{...first,date:"2026-02-30"}]}).success).toBe(false);
 expect(courseAgendaSchema.safeParse({...agenda,sessions:[{...first,endTime:"08:00"}]}).success).toBe(false);
 expect(courseAgendaSchema.safeParse({...agenda,sessions:[first,{...first,id:"b",startTime:"10:00"}]}).success).toBe(false);
});
it("preserves civil times and explicitly validates the course zone",()=>{expect(courseAgendaSchema.parse(agenda).sessions[0].startTime).toBe("09:00");expect(courseAgendaSchema.safeParse({...agenda,timezone:"invalid"}).success).toBe(false);});
it("rejects dates outside the course period",()=>{expect(courseAgendaSchema.safeParse({...agenda,startDate:"2026-02-01"}).success).toBe(false);});
