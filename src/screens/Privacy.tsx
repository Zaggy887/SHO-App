import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

function Mail() {
  return (
    <a href="mailto:info@strengthhubonline.com" className="font-semibold text-brand-400 active:opacity-70">
      info@strengthhubonline.com
    </a>
  )
}

function H2({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="mt-8 text-[17px] font-bold tracking-tight text-white">
      {n}. {children}
    </h2>
  )
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-5 text-[15px] font-bold text-white/90">{children}</h3>
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[15px] leading-relaxed text-white/70">{children}</p>
}

function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-3 space-y-2">{children}</ul>
}

function LI({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[15px] leading-relaxed text-white/70">
      <span className="mt-[0.55rem] h-1 w-1 shrink-0 rounded-full bg-white/40" />
      <span>{children}</span>
    </li>
  )
}

export default function Privacy({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <header
        className="flex shrink-0 items-center gap-2 px-3 py-2.5"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.625rem)' }}
      >
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/70 active:bg-white/10"
        >
          <ArrowLeft size={22} />
        </button>
        <p className="text-[17px] font-bold">Privacy Policy</p>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-12">
        <p className="pt-2 text-[13px] font-semibold text-white/40">Last updated: 29 July 2026</p>

        <P>
          StrengthHub Online (&ldquo;StrengthHub&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;our&rdquo;) is a fitness, training and nutrition app for university students. This
          policy explains what information we collect, how we use it, who we share it with, and the
          choices and rights you have. It is written to reflect what the app actually does.
        </P>
        <P>
          If you have any questions, contact us at <Mail />.
        </P>

        <H2 n={1}>Who we are</H2>
        <P>
          StrengthHub Online is operated by <strong className="font-bold text-white">Strengthhubonline</strong>.
          For any privacy question or request, email <Mail />.
        </P>
        <P>
          The app is intended for users <strong className="font-bold text-white">aged 18 and over</strong>{' '}
          who are studying at university. It is not directed at children (see section 9).
        </P>

        <H2 n={2}>What information we collect</H2>
        <P>We only collect what the app needs to work for you:</P>

        <H3>Account information</H3>
        <UL>
          <LI>Your email address and a password (used to create and secure your account).</LI>
          <LI>Optionally, a display name you choose.</LI>
        </UL>

        <H3>Your fitness and profile data (the content you create in the app)</H3>
        <UL>
          <LI>Your goals, training experience and preferences.</LI>
          <LI>Workouts, sessions and exercises you log.</LI>
          <LI>Nutrition entries, meal logs and food &ldquo;check-in&rdquo; tags.</LI>
          <LI>Body metrics you choose to enter, such as weight, and streaks/progress.</LI>
          <LI>
            Any injuries, limitations or dietary preferences you tell the app so it can tailor
            guidance to you.
          </LI>
        </UL>

        <H3>Meal photos (only when you use the photo scan)</H3>
        <UL>
          <LI>
            When you take or upload a photo of a meal, the image is sent to Google&rsquo;s Gemini AI
            to estimate its nutrition (see section 4).{' '}
            <strong className="font-bold text-white">We do not store your meal photos on our servers</strong>{' '}
            &mdash; only the resulting estimate (for example the meal name and calorie/macro figures)
            is saved to your account if you choose to log it.
          </LI>
        </UL>

        <H3>Device and notification data</H3>
        <UL>
          <LI>
            If you turn on notifications, we store a &ldquo;push token&rdquo; for your device so we
            can send the reminders you asked for. You can turn this off at any time in the
            app&rsquo;s settings or your device settings.
          </LI>
        </UL>

        <H3>Technical data</H3>
        <UL>
          <LI>
            Basic information needed to run a mobile app and keep it secure (for example app version
            and general error information). We do <strong className="font-bold text-white">not</strong>{' '}
            use third-party analytics or advertising SDKs.
          </LI>
        </UL>

        <H2 n={3}>How we use your information</H2>
        <P>We use your information to:</P>
        <UL>
          <LI>Create and secure your account and let you sign in.</LI>
          <LI>
            Provide the app&rsquo;s core features: training plans, logging, progress tracking,
            nutrition guidance and reminders.
          </LI>
          <LI>
            Personalise your experience (for example, respecting your goals, injuries and dietary
            preferences).
          </LI>
          <LI>Estimate the nutrition of meals you photograph, when you use that feature.</LI>
          <LI>Send you the notifications you have enabled.</LI>
          <LI>Keep the service safe, prevent abuse, and fix problems.</LI>
        </UL>
        <P>
          We do <strong className="font-bold text-white">not</strong> sell your personal information,
          and we do <strong className="font-bold text-white">not</strong> track you across other apps
          or websites for advertising.
        </P>

        <H2 n={4}>Artificial intelligence (AI) features</H2>
        <P>Some features use Google&rsquo;s Gemini AI, provided through Firebase AI Logic:</P>
        <UL>
          <LI>
            <strong className="font-bold text-white">Meal photo scan:</strong> the photo you submit is
            sent to Google&rsquo;s Gemini AI to estimate its nutrition. The result is an{' '}
            <strong className="font-bold text-white">estimate only</strong> and is not a substitute
            for a nutrition label or professional dietary advice.
          </LI>
          <LI>
            Any other AI-assisted guidance sends the relevant text you provide to Google&rsquo;s
            Gemini AI to generate a response.
          </LI>
        </UL>
        <P>
          When you use these features, the data you submit is processed by Google in accordance with
          Google&rsquo;s privacy terms. We ask you not to submit sensitive personal information you
          would not want processed this way.
        </P>

        <H2 n={5}>Who we share your information with</H2>
        <P>
          We share data only with the service providers that run the app for us, and only as needed
          to provide the service:
        </P>
        <UL>
          <LI>
            <strong className="font-bold text-white">Google Firebase</strong> &mdash; authentication,
            cloud database and storage, and hosting (Google LLC / Google Cloud).
          </LI>
          <LI>
            <strong className="font-bold text-white">Google Gemini (via Firebase AI Logic)</strong>{' '}
            &mdash; to power the AI features described in section 4.
          </LI>
        </UL>
        <P>
          These providers process data on our behalf under their own terms and security commitments.
          We may also disclose information if required by law, or to protect the rights, safety and
          security of our users and the service.
        </P>
        <P>
          We do <strong className="font-bold text-white">not</strong> sell your personal information
          to anyone.
        </P>

        <H2 n={6}>Where your data is stored and how we protect it</H2>
        <P>
          Your account and app data are stored using Google Firebase, in a data centre region located
          in <strong className="font-bold text-white">Australia</strong>. We rely on Firebase&rsquo;s
          security controls, enforce access rules so that you can generally only read and write your
          own data, and take reasonable steps to protect your information. No online service can be
          guaranteed to be 100% secure, but we work to keep your data safe.
        </P>

        <H2 n={7}>How long we keep your data</H2>
        <P>
          We keep your account and app data for as long as your account is active. If you delete your
          account (see section 8), we delete or de-identify your personal data that we hold, except
          where we are required to keep certain records by law.
        </P>

        <H2 n={8}>Your rights and choices</H2>
        <P>You can:</P>
        <UL>
          <LI>
            <strong className="font-bold text-white">Access and correct</strong> your information
            &mdash; most of it is editable directly in the app.
          </LI>
          <LI>
            <strong className="font-bold text-white">Delete your account and data</strong> &mdash; you
            can request deletion from within the app or by emailing <Mail />. When you delete your
            account, we remove your login and associated personal data.
          </LI>
          <LI>
            <strong className="font-bold text-white">Control notifications</strong> &mdash; turn
            reminders on or off in the app&rsquo;s settings or in your device settings.
          </LI>
          <LI>
            <strong className="font-bold text-white">Contact us</strong> about any privacy request at{' '}
            <Mail />.
          </LI>
        </UL>
        <P>
          Depending on where you live, you may have additional rights under local privacy law (for
          example, the Australian Privacy Principles). Contact us and we will help.
        </P>

        <H2 n={9}>Children&rsquo;s privacy</H2>
        <P>
          StrengthHub Online is intended for users{' '}
          <strong className="font-bold text-white">aged 18 and over</strong>. We do not knowingly
          collect personal information from children under 18. If you believe a child has provided us
          with personal information, contact us and we will delete it.
        </P>

        <H2 n={10}>Health and wellbeing disclaimer</H2>
        <P>
          StrengthHub Online provides{' '}
          <strong className="font-bold text-white">
            general fitness, training and nutrition information for health and wellbeing
          </strong>
          . It is <strong className="font-bold text-white">not a medical device</strong> and does not
          provide medical advice, diagnosis or treatment. Calorie and nutrition figures (including AI
          photo estimates) are approximate. Always seek advice from a qualified professional before
          making significant changes to your exercise or diet, and for any medical or mental-health
          concern.
        </P>

        <H2 n={11}>Changes to this policy</H2>
        <P>
          We may update this policy from time to time. When we do, we will change the &ldquo;Last
          updated&rdquo; date above and, where appropriate, notify you in the app. Your continued use
          of StrengthHub Online after an update means you accept the revised policy.
        </P>

        <H2 n={12}>Contact us</H2>
        <P>Strengthhubonline</P>
        <P>
          Email: <Mail />
        </P>
      </div>
    </div>
  )
}
