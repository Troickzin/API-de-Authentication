import Agenda from 'agenda';
import { emailVerificacaoConcluida } from './emailService';
import dotenv from 'dotenv';

// --------------------------------------------------------------------------------

dotenv.config();

// --------------------------------------------------------------------------------

const agenda = new Agenda({
    db: { address: process.env.CONFIG_MONGODB_URI || '', collection: 'Agenda' },
});

// --------------------------------------------------------------------------------

agenda.define('send email', async (job: any) => {
    const { to, time } = job.attrs.data;
    console.log(`Enviando e-mail para: ${to}`);
    await emailVerificacaoConcluida(to, "teste", "Teste");
});

// --------------------------------------------------------------------------------

(async function () {
    await agenda.start();
    console.log('  ');
    console.log('📆 Agenda iniciado!');
    console.log('  ');
})();

// --------------------------------------------------------------------------------

export const scheduleEmail = (time: Date, to: string) => {
    agenda.schedule(time, 'send email', { to, time });
    console.log(`E-mail agendado para ${to} em ${time}`);
};