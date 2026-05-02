import type { Metadata } from "next";

import LegalPage from "@/app/(legal)/_components/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidade | BT-Barber",
  description:
    "Como a BT-Barber coleta, usa e protege seus dados pessoais conforme a LGPD.",
};

const PrivacidadePage = () => (
  <LegalPage title="Política de Privacidade" updatedAt="01/05/2026">
    <p>
      Esta Política descreve como a BT-Barber (operada por{" "}
      <strong>[Razão Social, CNPJ]</strong>) coleta, usa e protege seus dados pessoais,
      em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
    </p>

    <h2>1. Controlador e contato do encarregado</h2>
    <p>
      <strong>Controlador:</strong> [Razão Social, CNPJ]
      <br />
      <strong>Encarregado (DPO):</strong> [Nome] — <strong>dpo@bt-barber.com.br</strong>
    </p>

    <h2>2. Dados que coletamos</h2>
    <ul>
      <li>
        <strong>Identificação:</strong> nome, e-mail e foto pública obtidos via Google
        OAuth no momento do cadastro.
      </li>
      <li>
        <strong>Reservas e pedidos:</strong> serviços/produtos escolhidos, barbearia,
        barbeiro, datas, valores, status do pagamento.
      </li>
      <li>
        <strong>Pagamento:</strong> os dados de cartão e PIX são processados diretamente
        pela Stripe e <strong>nunca trafegam ou são armazenados em nossos servidores</strong>.
        Recebemos da Stripe apenas o identificador da transação (
        <em>payment_intent_id</em>), o status e o valor.
      </li>
      <li>
        <strong>Tema do app:</strong> preferência claro/escuro (cookie + DB).
      </li>
      <li>
        <strong>Uso:</strong> logs de acesso (IP, user-agent, horário) para fins de
        segurança e auditoria.
      </li>
    </ul>

    <h2>3. Para que usamos os dados</h2>
    <ul>
      <li>Executar reservas, pedidos e cancelamentos (execução de contrato).</li>
      <li>Processar pagamentos via Stripe (execução de contrato).</li>
      <li>
        Comunicar a Barbearia sobre suas reservas (legítimo interesse, base do serviço).
      </li>
      <li>Cumprir obrigações fiscais e legais (obrigação legal).</li>
      <li>Detectar fraude, abuso e proteger a Plataforma (legítimo interesse).</li>
    </ul>

    <h2>4. Com quem compartilhamos</h2>
    <ul>
      <li>
        <strong>Barbearias:</strong> recebem nome, dados da reserva e status do
        pagamento, exclusivamente para executar o serviço.
      </li>
      <li>
        <strong>Stripe (sub-operador):</strong> processa o pagamento. Política em{" "}
        <a
          href="https://stripe.com/br/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          stripe.com/br/privacy
        </a>
        .
      </li>
      <li>
        <strong>Google (autenticação):</strong> recebe somente o pedido de login. Política
        em{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          policies.google.com/privacy
        </a>
        .
      </li>
      <li>
        <strong>Provedores de infraestrutura:</strong> Vercel (hospedagem), Supabase
        (banco de dados PostgreSQL hospedado em São Paulo/Brasil).
      </li>
      <li>
        <strong>Autoridades:</strong> mediante ordem judicial ou exigência legal.
      </li>
    </ul>
    <p>
      <strong>Não vendemos</strong> seus dados a terceiros e <strong>não usamos</strong>{" "}
      seus dados para publicidade comportamental.
    </p>

    <h2>5. Onde os dados ficam</h2>
    <p>
      Banco de dados hospedado no Brasil (Supabase, região sa-east-1, São Paulo).
      Dados de pagamento permanecem na infraestrutura da Stripe. A Stripe pode processar
      transações em servidores fora do Brasil — neste caso, com salvaguardas adequadas
      conforme art. 33 da LGPD.
    </p>

    <h2>6. Por quanto tempo guardamos</h2>
    <ul>
      <li>
        <strong>Conta:</strong> enquanto ativa. Após exclusão, dados pessoais identificáveis
        são removidos em até 30 dias.
      </li>
      <li>
        <strong>Reservas, pedidos e pagamentos:</strong> mínimo de 5 anos a partir da
        transação, para fins fiscais (art. 195, §5º da CF e Decreto 70.235/72).
      </li>
      <li>
        <strong>Logs de auditoria:</strong> 12 meses.
      </li>
    </ul>

    <h2>7. Seus direitos (LGPD art. 18)</h2>
    <p>Você tem direito a, mediante solicitação ao DPO:</p>
    <ul>
      <li>Confirmação de tratamento e acesso aos seus dados.</li>
      <li>Correção de dados incompletos ou desatualizados.</li>
      <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
      <li>Portabilidade dos dados.</li>
      <li>Revogação do consentimento.</li>
      <li>Oposição a tratamento feito com base em legítimo interesse.</li>
    </ul>
    <p>
      Para exercer seus direitos, escreva para{" "}
      <strong>dpo@bt-barber.com.br</strong>. Respondemos em até 15 dias.
    </p>

    <h2>8. Cookies</h2>
    <p>
      Usamos cookies estritamente necessários (sessão de login, preferência de tema) e
      cookies de telemetria (Vercel Analytics) que coletam dados agregados de uso. Não
      usamos cookies publicitários nem fingerprinting.
    </p>

    <h2>9. Segurança</h2>
    <p>
      Aplicamos criptografia em trânsito (HTTPS/TLS), autenticação OAuth, isolamento de
      banco com Row-Level Security, headers de segurança (CSP, HSTS, X-Frame-Options),
      rate limiting e log de auditoria de operações sensíveis.
    </p>

    <h2>10. Crianças e adolescentes</h2>
    <p>
      A Plataforma não é destinada a menores de 18 anos. Se identificarmos cadastro de
      menor sem autorização do responsável legal, removeremos a conta.
    </p>

    <h2>11. Atualizações</h2>
    <p>
      Esta Política pode ser atualizada. Mudanças relevantes serão comunicadas por
      e-mail e/ou aviso na Plataforma.
    </p>
  </LegalPage>
);

export default PrivacidadePage;
