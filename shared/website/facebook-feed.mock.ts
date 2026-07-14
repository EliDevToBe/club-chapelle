import type { FacebookFeedPostDto } from "~~/shared/website/facebook-feed-post.dto";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/archersdelachapelle";

const postUrl = (postId: string): string => {
  return `${FACEBOOK_PAGE_URL}/posts/${postId}`;
};

export const mockFacebookFeedPosts = (): FacebookFeedPostDto[] => {
  return [
    {
      id: "mock-post-001",
      message:
        "Belle séance d’initiation ce mercredi soir ! Merci à toutes celles et ceux qui sont venus découvrir le tir à l’arc au gymnase Tristan Tzara.",
      createdTime: "2026-06-28T19:45:00.000Z",
      permalinkUrl: postUrl("mock-post-001"),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
    },
    {
      id: "mock-post-002",
      message:
        "Rappel : le créneau du dimanche matin (9h–11h) est réservé aux archer·ère·s confirmé·e·s. Bon week-end à toutes et tous !",
      createdTime: "2026-06-22T08:30:00.000Z",
      permalinkUrl: postUrl("mock-post-002"),
      thumbnailUrl: null,
    },
    {
      id: "mock-post-003",
      message:
        "Félicitations à nos membres présents au concours départemental ce week-end. De belles performances et une super ambiance club !",
      createdTime: "2026-06-15T14:20:00.000Z",
      permalinkUrl: postUrl("mock-post-003"),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1564769662533-597f4a2c2a48?w=800&q=80",
    },
    {
      id: "mock-post-004",
      message:
        "Le club recherche des bénévoles pour l’accueil du mercredi soir. Si vous avez un créneau à proposer, contactez-nous par mail.",
      createdTime: "2026-06-10T17:00:00.000Z",
      permalinkUrl: postUrl("mock-post-004"),
      thumbnailUrl: null,
    },
    {
      id: "mock-post-005",
      message:
        "Photos de la sortie club à Fontainebleau — merci à celles et ceux qui ont organisé cette journée conviviale entre archer·ère·s.",
      createdTime: "2026-06-03T11:15:00.000Z",
      permalinkUrl: postUrl("mock-post-005"),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1518609878373-06d740f0d421?w=800&q=80",
    },
    {
      id: "mock-post-006",
      message:
        "Inscriptions saison 2026–2027 : pensez à renouveler votre licence FFTA. Les tarifs restent inchangés — voir la page Infos du site.",
      createdTime: "2026-05-27T09:00:00.000Z",
      permalinkUrl: postUrl("mock-post-006"),
      thumbnailUrl: null,
    },
    {
      id: "mock-post-007",
      message:
        "Entraînement technique jeudi soir : travail sur la posture et la respiration avec nos entraîneurs. Créneau confirmé·e·s uniquement.",
      createdTime: "2026-05-20T18:45:00.000Z",
      permalinkUrl: postUrl("mock-post-007"),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=800&q=80",
    },
    {
      id: "mock-post-008",
      message:
        "Merci à la mairie du 18e pour le soutien au club lors de la fête des quartiers. Nous avons pu faire découvrir le tir à l’arc à de nombreux passants.",
      createdTime: "2026-05-14T16:30:00.000Z",
      permalinkUrl: postUrl("mock-post-008"),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1508609349937-5ecad066a975?w=800&q=80",
    },
    {
      id: "mock-post-009",
      message:
        "Pas de créneau lundi 12 mai (jour férié). Reprise des entraînements le mercredi soir comme d’habitude.",
      createdTime: "2026-05-08T12:00:00.000Z",
      permalinkUrl: postUrl("mock-post-009"),
      thumbnailUrl: null,
    },
    {
      id: "mock-post-010",
      message:
        "Bravo aux initié·e·s du trimestre ! De nombreux progrès visibles — la prochaine étape : participer à un concours amical en interne.",
      createdTime: "2026-05-01T20:00:00.000Z",
      permalinkUrl: postUrl("mock-post-010"),
      thumbnailUrl: null,
    },
    {
      id: "mock-post-011",
      message:
        "Assemblée générale du club le 25 avril : merci à toutes celles et ceux présents. Compte-rendu disponible sur demande auprès du bureau.",
      createdTime: "2026-04-26T10:30:00.000Z",
      permalinkUrl: postUrl("mock-post-011"),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1456513087680-66a8c0e702ad?w=800&q=80",
    },
    {
      id: "mock-post-012",
      message:
        "Stage vacances de printemps : places limitées pour les 14–18 ans. Renseignements par mail à archerschapelle@gmail.com.",
      createdTime: "2026-04-18T15:45:00.000Z",
      permalinkUrl: postUrl("mock-post-012"),
      thumbnailUrl: null,
    },
    {
      id: "mock-post-013",
      message:
        "Nouveau matériel club : nous avons renouvelé une partie des arcs prêtés aux débutant·e·s. Merci aux adhérent·e·s pour leur contribution à la cagnotte.",
      createdTime: "2026-04-10T09:20:00.000Z",
      permalinkUrl: postUrl("mock-post-013"),
      thumbnailUrl:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    },
  ];
};
