"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Trash2Icon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { addClientNote, deleteClientNote } from "@/app/barber/_actions/notes";

interface Note {
  id: string;
  note: string;
  createdAt: Date;
}

interface IProps {
  shopId: string;
  clientId: string;
  notes: Note[];
}

const NotesPanel = ({ shopId, clientId, notes }: IProps) => {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await addClientNote(shopId, clientId, text);
        setText("");
        toast.success("Nota adicionada.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
      }
    });
  };

  const onDelete = (noteId: string) => {
    startTransition(async () => {
      try {
        await deleteClientNote(shopId, noteId);
        toast.success("Nota removida.");
      } catch {
        toast.error("Erro ao remover.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={onAdd} className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex.: corte 3 nas laterais, 5 em cima…"
          maxLength={500}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 tabular-nums">{text.length}/500</span>
          <Button
            type="submit"
            size="sm"
            disabled={pending || text.trim().length < 2}
          >
            {pending ? "Salvando..." : "Adicionar"}
          </Button>
        </div>
      </form>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-5 px-4 text-center text-[11px] text-gray-500">
            Nenhuma nota ainda. Adicione preferências, particularidades, etc.
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {notes.map((n) => (
            <li key={n.id}>
              <Card>
                <CardContent className="p-3 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap break-words">{n.note}</p>
                    <p className="text-[10px] text-gray-500 mt-1 tabular-nums">
                      {format(n.createdAt, "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(n.id)}
                    disabled={pending}
                    className="text-gray-500 hover:text-rose-400 transition-colors p-1 shrink-0"
                    aria-label="Remover nota"
                  >
                    <Trash2Icon size={14} />
                  </button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotesPanel;
