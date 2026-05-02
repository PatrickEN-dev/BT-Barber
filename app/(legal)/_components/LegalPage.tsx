import Container from "@/app/_components/Container";
import Header from "@/app/_components/Header";

interface LegalPageProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

const LegalPage = ({ title, updatedAt, children }: LegalPageProps) => (
  <>
    <Header />
    <main className="py-8 lg:py-12">
      <Container size="narrow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Última atualização: {updatedAt}
          </p>
        </div>
        <article className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:leading-relaxed [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
          {children}
        </article>
      </Container>
    </main>
  </>
);

export default LegalPage;
