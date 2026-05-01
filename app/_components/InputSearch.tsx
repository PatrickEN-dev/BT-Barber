"use client";

import { Button } from "@/app/_components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  search: z
    .string({
      required_error: "Campo obrigatório.",
    })
    .trim(),
});

interface SearchProps {
  defaultValues?: z.infer<typeof formSchema>;
  placeholderInput: string;
}

const InputSearch = ({ defaultValues, placeholderInput }: SearchProps) => {
  const { push } = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    const query = data.search.trim();
    if (!query) return;
    push(`/barbershop?search=${encodeURIComponent(query)}`);
  };

  return (
    <Form {...form}>
      <form
        className="flex w-full items-start gap-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="search"
          render={({ field }: any) => (
            <FormItem className="w-full">
              <FormControl>
                <Input placeholder={String(placeholderInput)} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button variant="accent" size="icon" type="submit" aria-label="Pesquisar">
          <SearchIcon size={18} />
        </Button>
      </form>
    </Form>
  );
};

export default InputSearch;
