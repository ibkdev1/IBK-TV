export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  language: string;
  streamUrl: string;
  backupUrl?: string;   // fallback if primary fails
  referer?: string;
  direct?: boolean;     // force direct (skip proxy)
}

// CDN domains known to allow CORS — streams load directly without proxy
const DIRECT_DOMAINS = [
  'akamaized.net',
  'cloudfront.net',
  'wurl.tv',
  'amagi.tv',
  'tubi.video',
  'lotus.stingray.com',
  'ntdtv.com',
  'savoir.media',
  'pbskids.org',
  'bozztv.com',
  'mediatailor.us-east-1.amazonaws.com',
  'wurl.com',
  'mediapackage.us-east-1.amazonaws.com',
  'fast-channels.sinclairstoryline.com',
  'tsv2.amagi.tv',
];

export function proxyUrl(rawUrl: string, referer?: string, direct?: boolean): string {
  // Channels with referer headers always need proxy
  if (referer) {
    let url = `/stream?url=${encodeURIComponent(rawUrl)}`;
    url += `&referer=${encodeURIComponent(referer)}`;
    return url;
  }
  // Explicit direct flag
  if (direct) return rawUrl;
  // Auto-detect CORS-friendly CDNs
  try {
    const hostname = new URL(rawUrl).hostname;
    if (DIRECT_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
      return rawUrl;
    }
  } catch { /* ignore */ }
  return `/stream?url=${encodeURIComponent(rawUrl)}`;
}

export const categories = [
  'All', 'Favorites', 'Mali', 'US', 'News', 'France', 'Canada', "Côte d'Ivoire", 'Niger', 'Sénégal', 'Guinée', 'Morocco', 'Congo', 'Burkina Faso', 'Cameroun', 'Benin', 'Togo', 'Arabic', 'Animals', 'Kids',
];

export const channels: Channel[] = [

  // ══════════════════════════════════════════════
  //  🇺🇸  UNITED STATES
  // ══════════════════════════════════════════════
  {
    id: 'fox-weather',
    name: 'Fox Weather',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Fox_Weather_logo.svg/120px-Fox_Weather_logo.svg.png',
    streamUrl: 'https://247wlive.foxweather.com/stream/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'cbs-news',
    name: 'CBS News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/CBS_News_logo_%282022%29.svg/120px-CBS_News_logo_%282022%29.svg.png',
    streamUrl: 'https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8',
    backupUrl: 'https://cbsnews.akamaized.net/hls/live/2020607/cbsnlineup_8/master.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'byutv',
    name: 'BYUtv',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/BYUtv_logo.svg/120px-BYUtv_logo.svg.png',
    streamUrl: 'https://d13j8jpstr8iqz.cloudfront.net/BYUtv.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'bounce-tv',
    name: 'Bounce TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Bounce_TV_logo.svg/120px-Bounce_TV_logo.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-bouncexl-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'pixl-tv',
    name: 'PixL TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/PixL_logo.svg/120px-PixL_logo.svg.png',
    streamUrl: 'https://frndlymsl.akamaized.net/hls/live/2006426/pixlmsl/pixlmsl/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'ion-plus',
    name: 'ION Plus',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Ion_Plus_logo.svg/120px-Ion_Plus_logo.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-ionplus-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'grit-tv',
    name: 'Grit Xtra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Grit_TV_logo.svg/120px-Grit_TV_logo.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-gritxtra-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'charge-tv',
    name: 'Charge!',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Charge%21_logo.svg/120px-Charge%21_logo.svg.png',
    streamUrl: 'https://fast-channels.sinclairstoryline.com/CHARGE/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'comet-tv',
    name: 'Comet TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Comet_TV_logo.svg/120px-Comet_TV_logo.svg.png',
    streamUrl: 'https://fast-channels.sinclairstoryline.com/COMET/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'court-tv',
    name: 'Court TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Court_TV_logo_%282019%29.svg/120px-Court_TV_logo_%282019%29.svg.png',
    streamUrl: 'https://amg01438-ewscrippscompan-courttv-tablo-nbcc7.amagi.tv/playlist/amg01438-ewscrippscompan-courttv-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'cspan',
    name: 'C-SPAN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/C-SPAN_logo.svg/120px-C-SPAN_logo.svg.png',
    streamUrl: 'https://547f72e6652371c3.mediapackage.us-east-1.amazonaws.com/out/v1/e3e6e29095844c4ba7d887f01e44a5ef/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'nbc-news-now',
    name: 'NBC News NOW',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/NBC_logo.svg/120px-NBC_logo.svg.png',
    streamUrl: 'https://d1bl6tskrpq9ze.cloudfront.net/hls/master.m3u8?ads.xumo_channelId=99984003',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'nasa-tv',
    name: 'NASA TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/120px-NASA_logo.svg.png',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'metv',
    name: 'MeTV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Me-TV_logo.svg/120px-Me-TV_logo.svg.png',
    streamUrl: 'http://104.255.88.155/metv/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'tbd-tv',
    name: 'TBD TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/C-SPAN_logo.svg/60px-C-SPAN_logo.svg.png',
    streamUrl: 'https://fast-channels.sinclairstoryline.com/TBD/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'dateline-247',
    name: 'Dateline 24/7',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/NBC_logo.svg/60px-NBC_logo.svg.png',
    streamUrl: 'https://d4whmvwm0rdvi.cloudfront.net/10007/99993007/hls/master.m3u8?ads.xumo_channelId=99993007',
    category: 'US',
    country: 'United States',
    language: 'English',
  },

  {
    id: 'afroland-tv',
    name: 'AfroLand TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://alt-al.otteravision.com/alt/al/al.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },

  // ══════════════════════════════════════════════
  //  🦁  ANIMALS & NATURE
  // ══════════════════════════════════════════════
  {
    id: 'better-life-nature',
    name: 'Nature Channel',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Nat_Geo_Wild_logo.svg/120px-Nat_Geo_Wild_logo.svg.png',
    streamUrl: 'https://tgn.bozztv.com/betterlife/betternature/betternature/index.m3u8',
    category: 'Animals',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'pet-collective',
    name: 'The Pet Collective',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Animal_Planet_Logo_2018.svg/120px-Animal_Planet_Logo_2018.svg.png',
    streamUrl: 'https://the-pet-collective-international-it.samsung.wurl.tv/playlist.m3u8',
    category: 'Animals',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'sport-outdoor',
    name: 'Sport Outdoor TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Outdoor_Channel_logo.svg/120px-Outdoor_Channel_logo.svg.png',
    streamUrl: 'https://gto2000-sportoutdoortv-1-it.samsung.wurl.tv/playlist.m3u8',
    category: 'Animals',
    country: 'International',
    language: 'English',
  },
  {
    id: 'duck-hunting-tv',
    name: 'Duck Hunting TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Outdoor_Channel_logo.svg/60px-Outdoor_Channel_logo.svg.png',
    streamUrl: 'https://main.duckhunting.playout.vju.tv/duckhuntingtv/main.m3u8',
    category: 'Animals',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'people-are-awesome',
    name: 'People Are Awesome',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Animal_Planet_Logo_2018.svg/60px-Animal_Planet_Logo_2018.svg.png',
    streamUrl: 'https://jukin-peopleareawesome-2-it.samsung.wurl.tv/playlist.m3u8',
    category: 'Animals',
    country: 'International',
    language: 'English',
  },

  // ══════════════════════════════════════════════
  //  🧒  KIDS
  // ══════════════════════════════════════════════
  {
    id: 'pbs-kids',
    name: 'PBS Kids',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PBS_Kids_Logo_2013.svg/120px-PBS_Kids_Logo_2013.svg.png',
    streamUrl: 'https://livestream.pbskids.org/out/v1/14507d931bbe48a69287e4850e53443c/est.m3u8',
    category: 'Kids',
    country: 'United States',
    language: 'English',
  },

  // ══════════════════════════════════════════════
  //  🇲🇱  MALI
  // ══════════════════════════════════════════════
  {
    id: 'ortm1',
    name: 'ORTM 1',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/15/ORTM_logo.png/120px-ORTM_logo.png',
    streamUrl: 'http://69.64.57.208/ortm/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'ortm2',
    name: 'ORTM 2',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/15/ORTM_logo.png/120px-ORTM_logo.png',
    streamUrl: 'http://69.64.57.208/tm2/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'africable',
    name: 'Africable TV',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/9/9c/Africable_logo.png/120px-Africable_logo.png',
    streamUrl: 'http://69.64.57.208/africable/playlist.m3u8',
    backupUrl:  'https://live20.bozztv.com/akamaissh101/ssh101/africable/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'd3tv',
    name: 'D3 TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'https://live20.bozztv.com/akamaissh101/ssh101/d3tvnet/playlist.m3u8',
    backupUrl:  'http://69.64.57.208/d3tv/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'nieta-tv',
    name: 'Niéta TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'http://69.64.57.208/nieta/playlist.m3u8',
    backupUrl:  'https://live20.bozztv.com/akamaissh101/ssh101/nieta/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'tm1-tv',
    name: 'TM1 TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'http://69.64.57.208/tm1/playlist.m3u8',
    backupUrl:  'https://live20.bozztv.com/akamaissh101/ssh101/tm1/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'cherifla-tv',
    name: 'Cherifla TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'http://69.64.57.208/cherifla/playlist.m3u8',
    backupUrl:  'https://live20.bozztv.com/akamaissh101/ssh101/cherifla/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇨🇮  CÔTE D'IVOIRE
  // ══════════════════════════════════════════════
  {
    id: 'rti1',
    name: 'RTI 1',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'http://69.64.57.208/rti1/playlist.m3u8',
    backupUrl: 'http://69.64.57.208:8080/rti1/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'rti2',
    name: 'RTI 2',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'http://69.64.57.208/rti2/playlist.m3u8',
    backupUrl: 'http://69.64.57.208:8080/rti2/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'rti-la3',
    name: 'RTI La 3',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'http://69.64.57.208/la3/index.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'nci',
    name: 'NCI',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/27/Logo_NCI.png/120px-Logo_NCI.png',
    streamUrl: 'http://69.64.57.208/nci/playlist.m3u8',
    backupUrl: 'http://69.64.57.208:8080/nci/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'aplus-ivoire',
    name: 'A+ Ivoire',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/60px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png',
    streamUrl: 'http://69.64.57.208/atv/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'business24',
    name: 'Business 24',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_C%C3%B4te_d%27Ivoire.svg/60px-Flag_of_C%C3%B4te_d%27Ivoire.svg.png',
    streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/business24_tv/hls_video/index.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇳🇪  NIGER
  // ══════════════════════════════════════════════
  {
    id: 'telesahel',
    name: 'Télé Sahel',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3f/Logo_Tele_Sahel.png/120px-Logo_Tele_Sahel.png',
    streamUrl: 'https://mediaserver1.castpin.com/hls/telesahel/index.m3u8',
    backupUrl: 'http://69.64.57.208/telesahel/playlist.m3u8',
    category: 'Niger',
    country: 'Niger',
    language: 'French',
  },
  {
    id: 'tal-tv',
    name: 'Tal TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Flag_of_Niger.svg/60px-Flag_of_Niger.svg.png',
    streamUrl: 'https://mediaserver1.castpin.com/hls/taltv/index.m3u8',
    category: 'Niger',
    country: 'Niger',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇸🇳  SÉNÉGAL
  // ══════════════════════════════════════════════
  {
    id: 'rts1',
    name: 'RTS 1',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c6/RTS_Logo.png/120px-RTS_Logo.png',
    streamUrl: 'http://69.64.57.208/rts1/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'rts2',
    name: 'RTS 2',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c6/RTS_Logo.png/120px-RTS_Logo.png',
    streamUrl: 'http://69.64.57.208/rts2/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'tfm',
    name: 'TFM',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/82/TFM_logo.png/120px-TFM_logo.png',
    streamUrl: 'http://69.64.57.208/tfm/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: '2stv',
    name: '2STV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/60px-Flag_of_Senegal.svg.png',
    streamUrl: 'http://69.64.57.208/2stv/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'sentv',
    name: 'Sen TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/60px-Flag_of_Senegal.svg.png',
    streamUrl: 'http://69.64.57.208/sentv/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },
  {
    id: 'walf-tv',
    name: 'Walf TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Flag_of_Senegal.svg/60px-Flag_of_Senegal.svg.png',
    streamUrl: 'http://69.64.57.208/walftv/playlist.m3u8',
    category: 'Sénégal',
    country: 'Sénégal',
    language: 'French/Wolof',
  },

  // ══════════════════════════════════════════════
  //  🇬🇳  GUINÉE CONAKRY
  // ══════════════════════════════════════════════
  {
    id: 'rtg1',
    name: 'RTG 1',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Guinea.svg/60px-Flag_of_Guinea.svg.png',
    streamUrl: 'http://69.64.57.208/rtg/playlist.m3u8',
    category: 'Guinée',
    country: 'Guinée Conakry',
    language: 'French',
  },
  {
    id: 'espace-tv',
    name: 'Espace TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Guinea.svg/60px-Flag_of_Guinea.svg.png',
    streamUrl: 'https://edge11.vedge.infomaniak.com/livecast/ik:espacetv/manifest.m3u8',
    category: 'Guinée',
    country: 'Guinée Conakry',
    language: 'French',
  },
  {
    id: 'kalac-tv',
    name: 'Kalac TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Flag_of_Guinea.svg/60px-Flag_of_Guinea.svg.png',
    streamUrl: 'https://edge13.vedge.infomaniak.com/livecast/ik:kalactv/manifest.m3u8',
    category: 'Guinée',
    country: 'Guinée Conakry',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇲🇦  MAROC
  // ══════════════════════════════════════════════
  {
    id: 'al-aoula',
    name: 'Al Aoula',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Al_Aoula_logo.svg/120px-Al_Aoula_logo.svg.png',
    streamUrl: 'https://stream-lb.livemedia.ma/alaoula/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic/French',
  },
  {
    id: '2m-maroc',
    name: '2M Maroc',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2M_Maroc_Logo.svg/120px-2M_Maroc_Logo.svg.png',
    streamUrl: 'https://d2qh3gh0k5vp3v.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-n6pess5lwbghr/2M_ES.m3u8',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic/French',
  },
  {
    id: 'arryadia',
    name: 'Arryadia Sport',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Arryadia_Logo.svg/120px-Arryadia_Logo.svg.png',
    streamUrl: 'https://stream-lb.livemedia.ma/arryadia/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic',
  },
  {
    id: 'al-maghribia',
    name: 'Al Maghribia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Logo_AlMaghribia.svg/120px-Logo_AlMaghribia.svg.png',
    streamUrl: 'https://stream-lb.livemedia.ma/almaghribia/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic',
  },

  // ══════════════════════════════════════════════
  //  🇫🇷  FRANCE
  // ══════════════════════════════════════════════
  {
    id: 'bfm-tv',
    name: 'BFM TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/BFM_TV_logo_2017.svg/120px-BFM_TV_logo_2017.svg.png',
    streamUrl: 'https://d1ib1gsg71oarf.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-scp7wda722jph/BFM2_FR.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'france2',
    name: 'France 2',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/France_2_logo_2008.svg/120px-France_2_logo_2008.svg.png',
    streamUrl: 'http://69.64.57.208/france2/mono.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'euronews-fr',
    name: 'Euronews FR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Euronews_logo_2022.svg/120px-Euronews_logo_2022.svg.png',
    streamUrl: 'https://2f6c5bf4.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmxheHhUVi1ldV9FdXJvbmV3c0ZyYW5jYWlzX0hMUw/playlist.m3u8',
    category: 'France',
    country: 'France/Europe',
    language: 'French',
  },
  {
    id: 'tv5monde',
    name: 'TV5Monde Afrique',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/TV5MONDE_logo_2019.svg/120px-TV5MONDE_logo_2019.svg.png',
    streamUrl: 'https://liveh12.vtvprime.vn/hls/TV5/03.m3u8',
    backupUrl: 'https://ott.tv5monde.com/Content/HLS/Live/channel(afrique)/variant.m3u8',
    category: 'France',
    country: 'France / Afrique',
    language: 'French',
  },
  {
    id: 'france24-fr',
    name: 'France 24 Français',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/France_24_logo_%282011%29.svg/120px-France_24_logo_%282011%29.svg.png',
    streamUrl: 'https://live.france24.com/hls/live/2037179-b/F24_FR_HI_HLS/master_2300.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'france24-en',
    name: 'France 24 English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/France_24_logo_%282011%29.svg/120px-France_24_logo_%282011%29.svg.png',
    streamUrl: 'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_2300.m3u8',
    category: 'France',
    country: 'France',
    language: 'English',
  },

  {
    id: 'france5',
    name: 'France 5',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/२a/France_5_logo_2002.svg/120px-France_5_logo_2002.svg.png',
    streamUrl: 'http://69.64.57.208/france5/mono.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'franceinfo-tv',
    name: 'Franceinfo TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Franceinfo_logo_2016.svg/120px-Franceinfo_logo_2016.svg.png',
    streamUrl: 'https://raw.githubusercontent.com/Sibprod/streams/main/ressources/dm/py/hls/franceinfotv.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'francophonie24',
    name: 'Francophonie 24',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/60px-Flag_of_France.svg.png',
    streamUrl: 'https://5421175365ea3.streamlock.net/live/smil:switch.smil/playlist.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'generations-tv',
    name: 'Générations TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/60px-Flag_of_France.svg.png',
    streamUrl: 'https://event.vedge.infomaniak.com/livecast/ik:generation-tv/manifest.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'africa24-sport',
    name: 'Africa 24 Sport',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1e/Africa_24_Logo.svg/120px-Africa_24_Logo.svg.png',
    streamUrl: 'https://africa24.vedge.infomaniak.com/livecast/ik:africa24sport/manifest.m3u8',
    category: 'France',
    country: 'Afrique',
    language: 'French',
  },
  {
    id: 'fifa-plus-fr',
    name: 'FIFA+ Français',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/FIFA_logo_without_slogan.svg/120px-FIFA_logo_without_slogan.svg.png',
    streamUrl: 'https://37b4c228.wurl.com/master/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWZyX0ZJRkFQbHVzRnJlbmNoX0hMUw/playlist.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'gong-tv',
    name: 'Gong TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/60px-Flag_of_France.svg.png',
    streamUrl: 'https://amg01596-gongnetworks-gong-ono-vh5f2.amagi.tv/1080p-vtt/index.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  📰  NEWS & INTERNATIONAL
  // ══════════════════════════════════════════════
  {
    id: 'cnn-news',
    name: 'CNN International',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/120px-CNN.svg.png',
    streamUrl: 'https://turnerlive.warnermediacdn.com/hls/live/586495/cnngo/cnn_slate/VIDEO_0_3564000.m3u8',
    category: 'News',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'dw-en',
    name: 'DW News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/120px-Deutsche_Welle_symbol_2012.svg.png',
    streamUrl: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    category: 'News',
    country: 'Germany',
    language: 'English',
  },
  {
    id: 'trt-world',
    name: 'TRT World',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/TRT_World_logo.svg/120px-TRT_World_logo.svg.png',
    streamUrl: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
    category: 'News',
    country: 'Turkey',
    language: 'English',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_Logo.svg/120px-Al_Jazeera_Logo.svg.png',
    streamUrl: 'https://live-hls-apps-aje.getaj.net/AJE/index.m3u8',
    category: 'News',
    country: 'International',
    language: 'English',
  },
  {
    id: 'africa24-fr',
    name: 'Africa24 FR',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1e/Africa_24_Logo.svg/120px-Africa_24_Logo.svg.png',
    streamUrl: 'https://africa24.vedge.infomaniak.com/livecast/ik:africa24/manifest.m3u8',
    category: 'News',
    country: 'Afrique',
    language: 'French',
  },
  {
    id: 'africa24-en',
    name: 'Africa24 EN',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/1/1e/Africa_24_Logo.svg/120px-Africa_24_Logo.svg.png',
    streamUrl: 'https://edge20.vedge.infomaniak.com/livecast/ik:africa24english/manifest.m3u8',
    category: 'News',
    country: 'Afrique',
    language: 'English',
  },

  // ══════════════════════════════════════════════
  //  🇧🇫  BURKINA FASO
  // ══════════════════════════════════════════════
  {
    id: 'rtb-bf',
    name: 'RTB Burkina',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/60px-Flag_of_Burkina_Faso.svg.png',
    streamUrl: 'http://69.64.57.208/rtb/playlist.m3u8',
    backupUrl: 'https://edge12.vedge.infomaniak.com/livecast/ik:rtblive1_8/manifest.m3u8',
    category: 'Burkina Faso',
    country: 'Burkina Faso',
    language: 'French',
  },
  {
    id: 'rtb2-bf',
    name: 'RTB2 Hauts-Bassins',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/60px-Flag_of_Burkina_Faso.svg.png',
    streamUrl: 'https://edge20.vedge.infomaniak.com/livecast/ik:rtbguiriko-1/manifest.m3u8',
    category: 'Burkina Faso',
    country: 'Burkina Faso',
    language: 'French',
  },
  {
    id: 'rtb3-bf',
    name: 'RTB3',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/60px-Flag_of_Burkina_Faso.svg.png',
    streamUrl: 'https://edge13.vedge.infomaniak.com/livecast/ik:rtb3-1/manifest.m3u8',
    category: 'Burkina Faso',
    country: 'Burkina Faso',
    language: 'French',
  },
  {
    id: 'burkina-info-tv',
    name: 'Burkina Info TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/60px-Flag_of_Burkina_Faso.svg.png',
    streamUrl: 'http://69.64.57.208/burkinainfo/index.m3u8',
    category: 'Burkina Faso',
    country: 'Burkina Faso',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇨🇲  CAMEROUN
  // ══════════════════════════════════════════════
  {
    id: 'crtv-cameroun',
    name: 'CRTV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Flag_of_Cameroon.svg/60px-Flag_of_Cameroon.svg.png',
    streamUrl: 'http://69.64.57.208/crtv/playlist.m3u8',
    category: 'Cameroun',
    country: 'Cameroun',
    language: 'French/English',
  },

  // ══════════════════════════════════════════════
  //  🇨🇩  CONGO
  // ══════════════════════════════════════════════
  {
    id: 'rtnc',
    name: 'RTNC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flag_of_the_Democratic_Republic_of_the_Congo.svg/60px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png',
    streamUrl: 'http://69.64.57.208/rtnc/playlist.m3u8',
    category: 'Congo',
    country: 'Congo DRC',
    language: 'French',
  },
  {
    id: 'tele-congo',
    name: 'Télé Congo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_the_Republic_of_the_Congo.svg/60px-Flag_of_the_Republic_of_the_Congo.svg.png',
    streamUrl: 'http://69.64.57.208/telecongo/playlist.m3u8',
    category: 'Congo',
    country: 'Congo Brazzaville',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇧🇯  BENIN
  // ══════════════════════════════════════════════
  {
    id: 'ortb-benin',
    name: 'ORTB Bénin',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Benin.svg/60px-Flag_of_Benin.svg.png',
    streamUrl: 'https://strhls.streamakaci.tv/ortb/ortb2-multi/playlist.m3u8',
    backupUrl: 'https://strhls.streamakaci.tv/ortb/ortb.m3u8',
    category: 'Benin',
    country: 'Bénin',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇹🇬  TOGO
  // ══════════════════════════════════════════════
  {
    id: 'tvt-togo',
    name: 'TVT (Télévision Togolaise)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flag_of_Togo.svg/60px-Flag_of_Togo.svg.png',
    streamUrl: 'http://69.64.57.208/tvt/playlist.m3u8',
    category: 'Togo',
    country: 'Togo',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🕌  ARABIC / ISLAMIC
  // ══════════════════════════════════════════════
  // ══════════════════════════════════════════════
  //  🇨🇦  CANADA
  // ══════════════════════════════════════════════
  {
    id: 'citynews-toronto',
    name: 'CityNews Toronto',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/CityNews_logo.svg/120px-CityNews_logo.svg.png',
    streamUrl: 'https://citynewsregional.akamaized.net/hls/live/1024052/Regional_Live_7/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'citynews-calgary',
    name: 'CityNews Calgary',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/CityNews_logo.svg/120px-CityNews_logo.svg.png',
    streamUrl: 'https://citynewsregional.akamaized.net/hls/live/1024053/Regional_Live_8/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'citynews-vancouver',
    name: 'CityNews Vancouver',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/CityNews_logo.svg/120px-CityNews_logo.svg.png',
    streamUrl: 'https://citynewsregional.akamaized.net/hls/live/1024054/Regional_Live_9/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'cpac',
    name: 'CPAC',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/73/CPAC_TV.png/120px-CPAC_TV.png',
    streamUrl: 'https://d7z3qjdsxbwoq.cloudfront.net/groupa/live/f9809cea-1e07-47cd-a94d-2ddd3e1351db/live.isml/.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'ici-rdi',
    name: 'ICI RDI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/ICI_RDI.svg/120px-ICI_RDI.svg.png',
    streamUrl: 'https://rcavlive.akamaized.net/hls/live/704025/xcanrdi/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'French',
  },
  {
    id: 'ici-montreal',
    name: 'ICI Montréal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ici_Radio-Canada_T%C3%A9l%C3%A9.svg/120px-Ici_Radio-Canada_T%C3%A9l%C3%A9.svg.png',
    streamUrl: 'https://amdici.akamaized.net/hls/live/873426/ICI-Live-Stream/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'French',
  },
  {
    id: 'ntd-canada',
    name: 'NTD Canada',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/NTD_Television_logo.svg/120px-NTD_Television_logo.svg.png',
    streamUrl: 'https://live.ntdtv.com/mllive860/playlist.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'tsn-the-ocho',
    name: 'TSN The Ocho',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/TSN_Logo_2018.svg/120px-TSN_Logo_2018.svg.png',
    streamUrl: 'https://d3pnbvng3bx2nj.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-rds8g35qfqrnv/TSN_The_Ocho.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'willow-sports',
    name: 'Willow Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Willow_TV_logo.svg/120px-Willow_TV_logo.svg.png',
    streamUrl: 'https://d36r8jifhgsk5j.cloudfront.net/Willow_TV.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'love-nature-ca',
    name: 'Love Nature',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Love_Nature_logo.png/120px-Love_Nature_logo.png',
    streamUrl: 'https://aegis-cloudfront-1.tubi.video/6d6d0f24-8445-4b4c-bdf6-44f9e38beaa4/playlist.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'wild-tv',
    name: 'Wild TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Wild_TV_Logo.png/120px-Wild_TV_Logo.png',
    streamUrl: 'https://d1tm3cz23db55z.cloudfront.net/v1/master/9d062541f2ff39b5c0f48b743c6411d25f62fc25/DistroTV-MuxIP-WildTV/476.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'canal-savoir',
    name: 'Canal Savoir',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Canal_Savoir_logo.png/120px-Canal_Savoir_logo.png',
    streamUrl: 'https://hls.savoir.media/live/stream.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'French',
  },
  {
    id: 'stingray-classic-rock',
    name: 'Stingray Classic Rock',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Stingray_Music_logo.svg/120px-Stingray_Music_logo.svg.png',
    streamUrl: 'https://lotus.stingray.com/manifest/ose-101ads-montreal/samsungtvplus/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'stingray-djazz',
    name: 'Stingray DJAZZ',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Stingray_Music_logo.svg/120px-Stingray_Music_logo.svg.png',
    streamUrl: 'https://lotus.stingray.com/manifest/djazz-djaads-montreal/samsungtvplus/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },

  {
    id: 'france24-arabic',
    name: 'France 24 عربي',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/France_24_logo.svg/120px-France_24_logo.svg.png',
    streamUrl: 'https://live.france24.com/hls/live/2037222-b/F24_AR_HI_HLS/master_2300.m3u8',
    category: 'Arabic',
    country: 'France/Arabic',
    language: 'Arabic',
  },
  {
    id: 'aljazeera-arabic',
    name: 'Al Jazeera عربي',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Al_Jazeera_channel_logo.svg/120px-Al_Jazeera_channel_logo.svg.png',
    streamUrl: 'https://live-hls-aje-ak.getaj.net/AJE/03.m3u8',
    referer: 'https://www.aljazeera.com/',
    category: 'Arabic',
    country: 'Qatar',
    language: 'Arabic',
  },
  {
    id: 'dw-arabic',
    name: 'DW عربي',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/120px-Deutsche_Welle_symbol_2012.svg.png',
    streamUrl: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8',
    referer: 'https://www.dw.com/',
    category: 'Arabic',
    country: 'Germany/Arabic',
    language: 'Arabic',
  },
];
