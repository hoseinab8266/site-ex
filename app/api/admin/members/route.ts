import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUsers, saveUsers, makePasswordHash, newUserId, type ManagedRole, type ManagedUser } from "@/lib/users-store";
import { randomElementAvatar } from "@/lib/avatars";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function managerOnly() { return (await getSession())?.role === "manager"; }
const publicUser = (u: ManagedUser) => ({ id:u.id, username:u.username, name:u.name, email:u.email, mobile:u.mobile, company:u.company, role:u.role, active:u.active, avatar:u.avatar, createdAt:u.createdAt });
const roles = ["manager", "member", "buyer"];
export async function GET() {
  if (!(await managerOnly())) return NextResponse.json({error:"دسترسی غیرمجاز"},{status:403});
  return NextResponse.json({users:(await getUsers()).map(publicUser)},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:Request) {
  if (!(await managerOnly())) return NextResponse.json({error:"دسترسی غیرمجاز"},{status:403});
  const b=await req.json().catch(()=>null); const username=String(b?.username??"").trim(); const name=String(b?.name??"").trim(); const password=String(b?.password??""); const role=String(b?.role??"buyer") as ManagedRole;
  if(username.length<3||name.length<2||password.length<8||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password)||!roles.includes(role)) return NextResponse.json({error:"نام، نام کاربری، نقش معتبر و رمز حداقل ۸ کاراکتری شامل حرف و عدد وارد کنید."},{status:400});
  const users=await getUsers(); const email=String(b?.email??"").trim();
  if(users.some(u=>u.username.toLowerCase()===username.toLowerCase()||(email&&u.email.toLowerCase()===email.toLowerCase()))) return NextResponse.json({error:"این نام کاربری یا ایمیل قبلاً ثبت شده است."},{status:409});
  const user:ManagedUser={id:newUserId(),username,name,email,mobile:String(b?.mobile??"").trim(),company:String(b?.company??"").trim(),role,active:b?.active!==false,avatar:String(b?.avatar??"").trim()||randomElementAvatar(),passwordHash:makePasswordHash(password),createdAt:new Date().toISOString()};
  users.unshift(user); await saveUsers(users); return NextResponse.json({user:publicUser(user)},{status:201});
}
export async function PUT(req:Request) {
  if (!(await managerOnly())) return NextResponse.json({error:"دسترسی غیرمجاز"},{status:403});
  const b=await req.json().catch(()=>null); if(!b?.id) return NextResponse.json({error:"شناسه کاربر الزامی است."},{status:400});
  const users=await getUsers(); const index=users.findIndex(u=>u.id===String(b.id)); if(index<0) return NextResponse.json({error:"کاربر پیدا نشد."},{status:404});
  const old=users[index]; const username=String(b.username??old.username).trim(); const name=String(b.name??old.name).trim(); const role=String(b.role??old.role) as ManagedRole; const email=String(b.email??old.email).trim();
  if(username.length<3||name.length<2||!roles.includes(role)) return NextResponse.json({error:"نام، نام کاربری یا نقش معتبر نیست."},{status:400});
  if(users.some((u,i)=>i!==index&&(u.username.toLowerCase()===username.toLowerCase()||(email&&u.email.toLowerCase()===email.toLowerCase())))) return NextResponse.json({error:"این نام کاربری یا ایمیل قبلاً استفاده شده است."},{status:409});
  const password=String(b.password??""); if(password&&(password.length<8||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))) return NextResponse.json({error:"رمز جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد."},{status:400});
  if(old.role==="manager"&&(!b.active||role!=="manager")&&users.filter(u=>u.role==="manager"&&u.active).length<=1) return NextResponse.json({error:"حداقل یک مدیر فعال باید باقی بماند."},{status:400});
  users[index]={...old,username,name,email,mobile:String(b.mobile??old.mobile).trim(),company:String(b.company??old.company).trim(),role,active:b.active!==false,avatar:String(b.avatar??old.avatar).trim(),...(password?{passwordHash:makePasswordHash(password)}:{})};
  await saveUsers(users); return NextResponse.json({user:publicUser(users[index])});
}
export async function DELETE(req:Request) {
  if (!(await managerOnly())) return NextResponse.json({error:"دسترسی غیرمجاز"},{status:403});
  const b=await req.json().catch(()=>null); const users=await getUsers(); const user=users.find(u=>u.id===String(b?.id??""));
  if(!user) return NextResponse.json({error:"کاربر پیدا نشد."},{status:404});
  if(user.role==="manager"&&users.filter(u=>u.role==="manager"&&u.active).length<=1) return NextResponse.json({error:"امکان حذف آخرین مدیر فعال وجود ندارد."},{status:400});
  await saveUsers(users.filter(u=>u.id!==user.id)); return NextResponse.json({ok:true});
}
