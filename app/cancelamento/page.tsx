import type { Metadata } from "next";

import LegalPage from "@/app/(legal)/_components/LegalPage";

export const metadata: Metadata = {
  title: "Política de Cancelamento | BT-Barber",
  description: "Regras de cancelamento e reembolso de reservas e pedidos na BT-Barber.",
};

const CancelamentoPage = () => (
  <LegalPage title="Política de Cancelamento" updatedAt="01/05/2026">
    <p>
      Esta política descreve como funcionam os cancelamentos e reembolsos na plataforma
      BT-Barber. Ela complementa os{" "}
      <a href="/termos">Termos de Uso</a>.
    </p>

    <h2>Reservas (serviços de barbearia)</h2>

    <h3>O que você paga ao reservar</h3>
    <p>
      Ao confirmar uma reserva online, você paga o subtotal (preço dos serviços
      escolhidos) acrescido da <strong>taxa de serviço da Plataforma</strong> (atualmente
      5% sobre o subtotal). O total fica visível no checkout antes da confirmação.
    </p>

    <h3>Tabela de reembolso</h3>
    <ul>
      <li>
        <strong>Cancelamento com 24h ou mais</strong> de antecedência: reembolso de{" "}
        <strong>100%</strong> do subtotal.
      </li>
      <li>
        <strong>Entre 2h e 24h</strong> antes do horário: reembolso de <strong>50%</strong>{" "}
        do subtotal. A outra metade fica retida pela Barbearia como compensação pela vaga
        bloqueada.
      </li>
      <li>
        <strong>Menos de 2h antes ou no-show (não comparecimento)</strong>: sem
        reembolso. A Barbearia retém 100% do subtotal.
      </li>
    </ul>

    <p>
      <strong>A taxa de serviço da Plataforma (5%) é retida em todos os casos</strong>,
      pois remunera o processamento da transação que já ocorreu, independentemente do
      cancelamento.
    </p>

    <h3>Como cancelar uma reserva</h3>
    <p>
      Acesse a tela <em>Reservas</em>, selecione a reserva e toque em{" "}
      <em>Cancelar</em>. O reembolso, quando aplicável, é processado automaticamente pela
      Stripe e cai na mesma forma de pagamento (cartão ou PIX). O prazo é de até{" "}
      <strong>10 dias úteis</strong>, dependendo do banco emissor.
    </p>

    <h3>Cancelamentos pela Barbearia</h3>
    <p>
      Se a Barbearia cancelar a reserva por imprevisto, você recebe reembolso integral do
      subtotal. A taxa de serviço da Plataforma é retida.
    </p>

    <h2>Pedidos da loja interna</h2>

    <h3>Antes da Barbearia preparar</h3>
    <p>
      Pedidos com status <em>Pendente</em> ou <em>Confirmado</em> podem ser cancelados
      pelo Cliente diretamente no app, com reembolso integral do subtotal. O estoque é
      reposto automaticamente. A taxa de serviço é retida.
    </p>

    <h3>Após preparado</h3>
    <p>
      Pedidos no status <em>Pronto</em> só podem ser cancelados pela Barbearia. Pedidos{" "}
      <em>Concluídos</em> não podem ser cancelados.
    </p>

    <h2>Direito de arrependimento (CDC)</h2>
    <p>
      Em compras à distância, o Cliente tem <strong>7 dias corridos</strong> para se
      arrepender da contratação (art. 49 do Código de Defesa do Consumidor). Para
      serviços agendados (reservas), o direito se aplica até o efetivo início da
      execução do serviço — em geral, isso coincide com o horário marcado.
    </p>
    <p>
      Para exercer o direito, escreva para{" "}
      <strong>contato@bt-barber.com.br</strong> com o número da reserva/pedido e a
      solicitação.
    </p>

    <h2>Disputas e contato</h2>
    <p>
      Em caso de divergência sobre um cancelamento, abra um chamado em{" "}
      <strong>contato@bt-barber.com.br</strong>. Respondemos em até 5 dias úteis. Se não
      for solucionado, você pode registrar reclamação em{" "}
      <a
        href="https://www.consumidor.gov.br"
        target="_blank"
        rel="noopener noreferrer"
      >
        consumidor.gov.br
      </a>
      .
    </p>
  </LegalPage>
);

export default CancelamentoPage;
