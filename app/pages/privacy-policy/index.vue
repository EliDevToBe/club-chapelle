<template>
  <ContentPageWrapper>
    <ChapSection
      is-main-section
      title="Politique de confidentialité"
      description="Comment l’association traite vos données personnelles"
    >
      <ContentTextWrapper class="text-muted">
        <p>
          Le responsable de traitement est l’association
          <span class="text-highlighted font-semibold">{{
            associationName
          }}</span
          >. Pour toute question ou pour exercer vos droits, écrivez à
          <ChapLink
            :to="`mailto:${contactEmail}`"
            :label="contactEmail"
            icon="i-ph-envelope-duotone"
          />.
        </p>
        <p>
          Cette politique décrit les traitements liés au site public et à
          l’espace membre (accès sur invitation uniquement).
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Formulaire de contact">
      <ContentTextWrapper class="text-muted">
        <p>
          <span :class="ui.listObject">Données : </span>
          <span>nom, adresse e-mail, objet et message</span>
        </p>
        <p>
          <span :class="ui.listObject">Finalité : </span>
          <span
            >répondre à votre demande (informations, essai, inscription)</span
          >
        </p>
        <p>
          <span :class="ui.listObject">Base légale : </span>
          <span>intérêt légitime</span>
        </p>
        <p>
          <span :class="ui.listObject">Destinataire : </span>
          <span>le bureau, via notre prestataire d’e-mail (Mailtrap)</span>
        </p>
        <p>
          <span :class="ui.listObject">Durée : </span>
          <span>le temps de l’échange, puis un archivage (12 mois)</span>
        </p>
        <p>Ces messages ne constituent pas un fichier de prospection.</p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection v-if="competitionFlag" title="Comptes membres (invitation)">
      <ContentTextWrapper class="text-muted">
        <p>
          Aucun visiteur ne peut créer un compte de lui-même. Un compte n’est
          ouvert que sur invitation du club.
        </p>
        <p>
          <span :class="ui.listObject">Données : </span>
          <span>nom, e-mail, mot de passe (chiffré), rôles</span>
        </p>
        <p>
          <span :class="ui.listObject">Finalité : </span>
          <span>accès à l’espace membre (compétitions, participations)</span>
        </p>
        <p>
          <span :class="ui.listObject">Base légale : </span>
          <span>intérêt légitime et gestion de la relation associative</span>
        </p>
        <p>
          <span :class="ui.listObject">Destinataire : </span>
          <span>le bureau</span>
        </p>
        <p>
          <span :class="ui.listObject">Durée : </span>
          <span
            >tant que l’accès est actif. Après révocation ou période
            d'inactivité (1 an), effacement des données. Une ré-invitation est
            nécessaire pour accéder à nouveau à l'espace membre.</span
          >
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection v-if="competitionFlag" title="Gestion du club">
      <ContentTextWrapper class="text-muted">
        <p>
          Le back-office conserve les fiches des archers, les compétitions et
          les participations ainsi que leur états. Le statut de paiement est un
          suivi interne, sans paiement en ligne.
        </p>
        <p>
          <span :class="ui.listObject">Données : </span>
          <span
            >nom public, compétitions, participations, statut de paiement</span
          >
        </p>
        <p>
          <span :class="ui.listObject">Finalité : </span>
          <span>gestion de la vie du club</span>
        </p>
        <p>
          <span :class="ui.listObject">Base légale : </span>
          <span>intérêt légitime de la vie du club</span>
        </p>
        <p>
          <span :class="ui.listObject">Destinataire : </span>
          <span>le bureau (selon les rôles)</span>
        </p>
        <p>
          <span :class="ui.listObject">Durée : </span>
          <span>saison sportive concernée, puis archivage limité</span>
        </p>
        <p>
          Après révocation d’un compte, la fiche archer et l’historique des
          participations sont conservés (continuité du club), sans laisser un
          login actif. Tout lien aux données personnelles est supprimé.
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection v-if="competitionFlag" title="Mot de passe oublié">
      <ContentTextWrapper class="text-muted">
        <p>
          Un lien de réinitialisation est envoyé par e-mail. Le jeton est à
          usage unique.
        </p>
        <p>
          <span :class="ui.listObject">Données : </span>
          <span>adresse e-mail, jeton de réinitialisation</span>
        </p>
        <p>
          <span :class="ui.listObject">Finalité : </span>
          <span>permettre de choisir un nouveau mot de passe</span>
        </p>
        <p>
          <span :class="ui.listObject">Base légale : </span>
          <span>intérêt légitime (sécurité du compte)</span>
        </p>
        <p>
          <span :class="ui.listObject">Destinataire : </span>
          <span>le membre, via notre prestataire d’e-mail (Mailtrap)</span>
        </p>
        <p>
          <span :class="ui.listObject">Durée : </span>
          <span>jusqu’à utilisation du lien, expiration après 1 heure</span>
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Photos">
      <ContentTextWrapper class="text-muted">
        <p>Les photos du carrousel d’accueil sont hébergées chez Sirv.</p>
        <p>
          <span :class="ui.listObject">Données : </span>
          <span>photos et images, personnes éventuellement identifiables</span>
        </p>
        <p>
          <span :class="ui.listObject">Finalité : </span>
          <span>présentation du club</span>
        </p>
        <p>
          <span :class="ui.listObject">Base légale : </span>
          <span
            >intérêt légitime de la vie associative, et consentement lorsque des
            personnes sont identifiables</span
          >
        </p>
        <p>
          <span :class="ui.listObject">Destinataire : </span>
          <span>Sirv (hébergeur)</span>
        </p>
        <p>
          <span :class="ui.listObject">Durée : </span>
          <span
            >tant que la photo est publiée. Retrait et suppression sur demande
            auprès du club</span
          >
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection v-if="facebookFeedFlag" title="Actualités Facebook">
      <ContentTextWrapper class="text-muted">
        <p>
          Le site peut afficher des publications de la page Facebook du club
          (liens vers Facebook). Le chargement prévu se fait côté serveur, sans
          déposer de cookies de suivi Facebook sur votre navigateur. En cliquant
          vers Facebook, vous quittez ce site et êtes soumis à la politique de
          Meta.
        </p>
        <p>
          <span :class="ui.listObject">Données : </span>
          <span
            >publications publiques de la page (pas de données visiteurs)</span
          >
        </p>
        <p>
          <span :class="ui.listObject">Finalité : </span>
          <span>communication associative</span>
        </p>
        <p>
          <span :class="ui.listObject">Base légale : </span>
          <span>intérêt légitime de communication associative</span>
        </p>
        <p>
          <span :class="ui.listObject">Destinataire : </span>
          <span>visiteurs du site</span>
        </p>
        <p>
          <span :class="ui.listObject">Durée : </span>
          <span>pas de copie durable des données</span>
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Cookies">
      <ContentTextWrapper class="text-muted">
        <p>
          Ce site n’utilise pas de cookies publicitaires ni d’outils de mesure
          d’audience. Seuls des cookies strictement nécessaires à la connexion
          sont déposés lorsque vous vous identifiez :
        </p>
        <p>
          Ces jetons d'authentification sont valides entre 20 minutes et 7
          jours.
        </p>
        <p>
          Conformément aux lignes directrices de la CNIL, ces cookies techniques
          ne nécessitent pas de bandeau de consentement. Ils ne sont partagés
          avec aucun tiers pour quelconque finalité.
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Mineur·e·s">
      <ContentTextWrapper class="text-muted">
        <p>
          Le club peut accueillir les jeunes à partir de 14 ans. En France, un
          mineur·e de moins de 15 ans ne peut pas, seul·e, consentir à un
          service en ligne. Les comptes restent ouverts sur invitation. Pour les
          14–15 ans, l’invitation s’inscrit dans le cadre parental /
          représentant légal.
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Sécurité">
      <ContentTextWrapper class="text-muted">
        <p>
          Les mots de passe sont chiffrés. L’accès aux comptes est protégé par
          des cookies de session et des contrôles selon les rôles. Les clés
          d’accès aux services externes restent sur le serveur et ne sont pas
          exposées dans le navigateur.
        </p>
      </ContentTextWrapper>
    </ChapSection>

    <ChapSection title="Vos droits">
      <ContentTextWrapper class="text-muted">
        <p>
          Vous pouvez demander l’accès, la rectification, l’effacement, la
          limitation, l’opposition, et la portabilité lorsque le droit
          l’applique. Écrivez à
          <ChapLink
            :to="`mailto:${contactEmail}`"
            :label="contactEmail"
            icon="i-ph-envelope-duotone"
          />. L’association s’efforce de répondre dans un délai d’un mois.
        </p>
        <p>
          Vous pouvez aussi introduire une réclamation auprès de la CNIL :
          <ChapLink
            to="https://www.cnil.fr"
            label="www.cnil.fr"
            target="_blank"
          />.
        </p>
      </ContentTextWrapper>
    </ChapSection>
  </ContentPageWrapper>
</template>

<script setup lang="ts">
import ContentPageWrapper from "~/components/layout/ContentPageWrapper.vue";
import ContentTextWrapper from "~/components/layout/ContentTextWrapper.vue";
import ChapLink from "~/components/ui/ChapLink.vue";
import ChapSection from "~/components/ui/ChapSection.vue";
import { useFeatureFlags } from "~/composables/useFeatureFlags";
import { useSiteSettings } from "~/composables/useSiteSettings";
import { ASSOCIATION_LEGAL_NAME } from "~~/shared/website/site-settings.seed";

useHead({
  title: "Politique de confidentialité - Arc18",
});

const { contactEmail } = await useSiteSettings();
const { isEnabled } = useFeatureFlags();
const competitionFlag = isEnabled("competition_dashboard");
const facebookFeedFlag = isEnabled("facebook_feed");
const associationName = ASSOCIATION_LEGAL_NAME;

const ui = {
  listObject: "text-neutral-300 font-semibold",
};
</script>
