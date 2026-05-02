import type { Metadata } from "next";

import LegalPage from "@/app/(legal)/_components/LegalPage";

export const metadata: Metadata = {
  title: "Termos de Uso | BT-Barber",
  description: "Termos de uso da plataforma BT-Barber.",
};

const TermosPage = () => (
  <LegalPage title="Termos de Uso" updatedAt="01/05/2026">
    <p>
      Ao usar a plataforma BT-Barber (&quot;Plataforma&quot;) você (&quot;Cliente&quot;) concorda com
      estes Termos de Uso. A Plataforma conecta clientes a barbearias parceiras
      (&quot;Barbearias&quot;) e processa pagamentos online em nome delas.
    </p>

    <h2>1. Quem somos</h2>
    <p>
      A BT-Barber é operada por <strong>[Razão Social, CNPJ]</strong>, com sede em{" "}
      <strong>[Endereço]</strong>. Nosso contato oficial é{" "}
      <strong>contato@bt-barber.com.br</strong>.
    </p>

    <h2>2. O que a Plataforma faz</h2>
    <ul>
      <li>Permite reservar serviços (corte, barba, etc.) com Barbearias.</li>
      <li>Permite comprar produtos da loja interna de cada Barbearia.</li>
      <li>Processa o pagamento online via Stripe (PIX e cartão de crédito).</li>
      <li>
        Repassa o valor dos serviços/produtos para a Barbearia, descontando uma taxa de
        serviço sobre o pagamento processado.
      </li>
    </ul>

    <h2>3. Cadastro e responsabilidades do Cliente</h2>
    <p>
      O cadastro é feito via Google OAuth. Você é responsável por manter as informações
      atualizadas e por toda atividade na sua conta. Não compartilhe seu acesso.
    </p>

    <h2>4. Pagamentos e taxa de serviço</h2>
    <p>
      Ao concluir uma reserva ou pedido, o Cliente paga o subtotal (valor dos serviços ou
      produtos) acrescido de uma taxa de serviço da Plataforma, exibida de forma
      transparente antes da confirmação. A taxa de serviço atual é de{" "}
      <strong>5% (cinco por cento) sobre o subtotal</strong>, podendo variar por
      Barbearia. Os valores são processados pela Stripe.
    </p>
    <p>
      A <strong>taxa de serviço da Plataforma é retida em qualquer hipótese</strong>,
      mesmo em caso de cancelamento ou reembolso, pois remunera o serviço de processamento
      de pagamento e operação da Plataforma.
    </p>

    <h2>5. Cancelamento e reembolso de reservas</h2>
    <p>
      O cancelamento de reservas pagas segue a política de tempo até o horário marcado:
    </p>
    <ul>
      <li>
        <strong>24 horas ou mais antes</strong>: reembolso integral do valor dos serviços
        (taxa de serviço da Plataforma retida).
      </li>
      <li>
        <strong>Entre 2 e 24 horas antes</strong>: reembolso de 50% do valor dos serviços.
        A outra metade fica retida pela Barbearia como taxa de cancelamento.
      </li>
      <li>
        <strong>Menos de 2 horas antes ou no-show</strong>: sem reembolso. O valor
        integral fica retido pela Barbearia.
      </li>
    </ul>
    <p>
      A política completa está descrita em{" "}
      <a href="/cancelamento">/cancelamento</a>.
    </p>

    <h2>6. Cancelamento de pedidos da loja</h2>
    <p>
      Pedidos da loja podem ser cancelados pelo Cliente enquanto estiverem nos status
      <em> Pendente</em> ou <em>Confirmado</em>. O reembolso é integral, descontada a
      taxa de serviço da Plataforma. Após o status passar para <em>Pronto</em> ou{" "}
      <em>Concluído</em>, o cancelamento depende da Barbearia.
    </p>

    <h2>7. Responsabilidade pelas Barbearias</h2>
    <p>
      A BT-Barber atua como intermediadora entre Cliente e Barbearia. A execução dos
      serviços, a qualidade do atendimento, dos produtos e a emissão de notas fiscais é
      <strong> responsabilidade integral da Barbearia parceira</strong>.
    </p>

    <h2>8. Conduta proibida</h2>
    <ul>
      <li>Reservar horários em nome de terceiros sem autorização.</li>
      <li>Fazer reservas em massa sem intenção de comparecer.</li>
      <li>Tentar acessar dados de outros usuários ou da Plataforma.</li>
      <li>Usar a Plataforma para qualquer atividade ilícita.</li>
    </ul>

    <h2>9. Limitação de responsabilidade</h2>
    <p>
      A Plataforma é fornecida &quot;como está&quot;. Falhas de terceiros (Stripe, Google,
      provedores de hospedagem) podem afetar temporariamente o serviço. Não nos
      responsabilizamos por lucros cessantes nem danos indiretos.
    </p>

    <h2>10. Encerramento da conta</h2>
    <p>
      Você pode solicitar a exclusão da sua conta a qualquer momento via{" "}
      <strong>contato@bt-barber.com.br</strong>. Reservas ou pedidos passados ficam
      registrados pelo prazo legal para fins de auditoria fiscal.
    </p>

    <h2>11. Alterações destes Termos</h2>
    <p>
      Estes Termos podem ser atualizados. Mudanças relevantes serão comunicadas no
      e-mail cadastrado e/ou na Plataforma. O uso após a alteração implica aceite.
    </p>

    <h2>12. Foro</h2>
    <p>
      Fica eleito o foro da comarca de <strong>[Cidade/UF]</strong>, com renúncia
      expressa a qualquer outro, para dirimir disputas oriundas destes Termos.
    </p>
  </LegalPage>
);

export default TermosPage;
