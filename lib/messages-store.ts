import "server-only";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type MessageKind = "contact" | "consultation";
export type Message = {
  id: string;
  kind: MessageKind;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  subject?: string;
  product?: string;
  application?: string;
  quantity?: string;
  bestTime?: string;
  text: string;
  createdAt: string;
  read: boolean;
};

const file = path.join(process.cwd(), "data", "messages.json");

export async function getMessages(): Promise<Message[]> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(parsed)) return parsed as Message[];
  } catch {
    /* فایل هنوز ساخته نشده است */
  }
  return [];
}

export async function saveMessages(items: Message[]) {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, JSON.stringify(items, null, 2), "utf8");
  await rename(temp, file);
}

export async function addMessage(input: Omit<Message, "id" | "createdAt" | "read">) {
  const all = await getMessages();
  const message: Message = { ...input, id: randomUUID(), createdAt: new Date().toISOString(), read: false };
  await saveMessages([message, ...all]);
  return message;
}

export async function setMessageRead(id: string, read = true) {
  const all = await getMessages();
  const item = all.find((m) => m.id === id);
  if (!item) return null;
  item.read = read;
  await saveMessages(all);
  return item;
}

export async function removeMessage(id: string) {
  const all = await getMessages();
  const next = all.filter((m) => m.id !== id);
  if (next.length === all.length) return false;
  await saveMessages(next);
  return true;
}
