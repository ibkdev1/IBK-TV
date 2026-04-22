export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  country: string;
  language: string;
  streamUrl: string;
  backupUrl?: string;        // fallback if primary fails
  referer?: string;
  direct?: boolean;          // force direct (skip proxy)
  youtubeChannelId?: string; // if set, embed YouTube live instead of HLS
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
  // CORS-verified — bypass proxy for faster playback
  'france24.com',
  'cbsnstream.cbsnews.com',
  'medya.trt.com.tr',
  'castpin.com',
  'streamakaci.tv',
  'nhkworld.jp',
  'infomaniak.com',
];

export function proxyUrl(rawUrl: string, referer?: string, direct?: boolean): string {
  if (referer) {
    return `/stream?url=${encodeURIComponent(rawUrl)}&referer=${encodeURIComponent(referer)}`;
  }
  if (direct) return rawUrl;
  try {
    const hostname = new URL(rawUrl).hostname;
    if (DIRECT_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
      return rawUrl;
    }
  } catch { /* ignore */ }
  return `/stream?url=${encodeURIComponent(rawUrl)}`;
}

export const categories = [
  'All', 'Favorites', 'News', 'Mali', 'US', 'Saudi Arabia', 'Sports', 'France', 'Canada', "Côte d'Ivoire", 'Niger', 'Sénégal', 'Guinée', 'Morocco', 'Egypt', 'Tunisia', 'Congo', 'Burkina Faso', 'Cameroun', 'Benin', 'Togo', 'Ghana', 'Nigeria', 'Gambia', 'Guinea-Bissau', 'Sierra Leone', 'Kenya', 'Ethiopia', 'Tanzania', 'Arabic', 'Animals', 'Kids',
];

export const channels: Channel[] = [

  // ══════════════════════════════════════════════
  //  🇺🇸  UNITED STATES
  // ══════════════════════════════════════════════
  {
    id: 'fox-weather',
    name: 'Fox Weather',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Fox_Weather_logo.svg/120px-Fox_Weather_logo.svg.png',
    streamUrl: 'https://247wlive.foxweather.com/stream/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'cbs-news',
    name: 'CBS News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/CBS_News_2020_%28Stacked_II%29.svg/120px-CBS_News_2020_%28Stacked_II%29.svg.png',
    streamUrl: 'https://cbsn-us.cbsnstream.cbsnews.com/out/v1/55a8648e8f134e82a470f83d562deeca/master.m3u8',
    backupUrl: 'https://cbsnews.akamaized.net/hls/live/2020607/cbsnlineup_8/master.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'byutv',
    name: 'BYUtv',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/BYUtv_logo.svg/120px-BYUtv_logo.svg.png',
    streamUrl: 'https://d13j8jpstr8iqz.cloudfront.net/BYUtv.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'bounce-tv',
    name: 'Bounce TV',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Bounce_TV_logo.svg/120px-Bounce_TV_logo.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-bouncexl-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'ion-plus',
    name: 'ION Plus',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/ION_Plus_logo.svg/120px-ION_Plus_logo.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-ionplus-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'grit-tv',
    name: 'Grit Xtra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01438-ewscrippscompan-gritxtra-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'charge-tv',
    name: 'Charge!',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Charge%21_Logo_2020.svg/120px-Charge%21_Logo_2020.svg.png',
    streamUrl: 'https://fast-channels.sinclairstoryline.com/CHARGE/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'comet-tv',
    name: 'Comet TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Comet_TV_2015_logo.svg/120px-Comet_TV_2015_logo.svg.png',
    streamUrl: 'https://fast-channels.sinclairstoryline.com/COMET/index.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'court-tv',
    name: 'Court TV',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Court_TV_2019.svg/120px-Court_TV_2019.svg.png',
    streamUrl: 'https://amg01438-ewscrippscompan-courttv-tablo-nbcc7.amagi.tv/playlist/amg01438-ewscrippscompan-courttv-tablo/playlist.m3u8',
    category: 'US',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'cspan',
    name: 'C-SPAN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/C-SPAN_Logo_%282019%29.svg/120px-C-SPAN_Logo_%282019%29.svg.png',
    streamUrl: 'https://547f72e6652371c3.mediapackage.us-east-1.amazonaws.com/out/v1/e3e6e29095844c4ba7d887f01e44a5ef/index.m3u8',
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
    id: 'tbd-tv',
    name: 'TBD TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/C-SPAN_Logo_%282019%29.svg/60px-C-SPAN_Logo_%282019%29.svg.png',
    streamUrl: 'https://fast-channels.sinclairstoryline.com/TBD/index.m3u8',
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
  //  🇸🇦  SAUDI ARABIA
  // ══════════════════════════════════════════════
  {
    id: 'alarabiya',
    name: 'العربية',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Al_Arabiya_-Logo_%281%29.png/120px-Al_Arabiya_-Logo_%281%29.png',
    streamUrl: 'https://svs.itworkscdn.net/alarabiyalive/alarabiya.smil/playlist.m3u8',
    category: 'Saudi Arabia',
    country: 'Saudi Arabia',
    language: 'Arabic',
  },
  {
    id: 'alhadath',
    name: 'الحدث',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Al_Hadath_TV_logo_2023.svg/120px-Al_Hadath_TV_logo_2023.svg.png',
    streamUrl: 'https://svs.itworkscdn.net/alhadathlive/alhadath.smil/playlist.m3u8',
    category: 'Saudi Arabia',
    country: 'Saudi Arabia',
    language: 'Arabic',
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
  {
    id: 'nasa-tv',
    name: 'NASA TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/60px-NASA_logo.svg.png',
    streamUrl: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
    category: 'Animals',
    country: 'United States',
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
  //  ⚽  SPORTS
  // ══════════════════════════════════════════════
  {
    id: 'red-bull-tv',
    name: 'Red Bull TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    category: 'Sports',
    country: 'International',
    language: 'English',
  },
  {
    id: 'ftf-sports',
    name: 'FTF Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://1657061170.rsc.cdn77.org/HLS/FTF-LINEAR.m3u8',
    direct: true,
    category: 'Sports',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'tvs-sports',
    name: 'TVS Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://rpn.bozztv.com/gusa/gusa-tvssports/index.m3u8',
    category: 'Sports',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'tvs-classic-sports',
    name: 'TVS Classic Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://rpn.bozztv.com/gusa/gusa-tvs/index.m3u8',
    category: 'Sports',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'tvs-women-sports',
    name: 'TVS Women Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://rpn.bozztv.com/gusa/gusa-tvswsn/index.m3u8',
    category: 'Sports',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'tvs-sports-bureau',
    name: 'TVS Sports Bureau',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
    streamUrl: 'https://rpn.bozztv.com/gusa/gusa-tvssportsbureau/index.m3u8',
    category: 'Sports',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'tudn',
    name: 'TUDN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/TUDN_Logo.svg/120px-TUDN_Logo.svg.png',
    streamUrl: 'https://streaming-live-fcdn.api.prd.univisionnow.com/tudn/tudn.isml/hls/tudn.m3u8',
    category: 'Sports',
    country: 'United States',
    language: 'Spanish',
  },

  // ══════════════════════════════════════════════
  //  🇲🇱  MALI
  // ══════════════════════════════════════════════
  {
    id: 'ortm1',
    name: 'ORTM 1',
    logo: 'https://i.imgur.com/eKUpcls.png',
    streamUrl: 'http://69.64.57.208/ortm/playlist.m3u8',
    backupUrl: 'http://69.64.57.208/ortm/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'ortm2',
    name: 'ORTM 2',
    logo: 'https://i.imgur.com/GQ4fHsv.png',
    streamUrl: 'http://69.64.57.208/tm2/playlist.m3u8',
    backupUrl: 'http://69.64.57.208/tm2/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'africable',
    name: 'Africable TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Africable_T%C3%A9l%C3%A9vision_logo.jpg/120px-Africable_T%C3%A9l%C3%A9vision_logo.jpg',
    streamUrl: 'http://69.64.57.208/africable/playlist.m3u8',
    backupUrl:  'http://69.64.57.208/africable/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'nieta-tv',
    name: 'Niéta TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'http://69.64.57.208/nieta/playlist.m3u8',
    backupUrl:  'http://69.64.57.208/nieta/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'tm1-tv',
    name: 'TM1 TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'http://69.64.57.208/tm1/playlist.m3u8',
    backupUrl:  'http://69.64.57.208/tm1/playlist.m3u8',
    category: 'Mali',
    country: 'Mali',
    language: 'French',
  },
  {
    id: 'cherifla-tv',
    name: 'Cherifla TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Flag_of_Mali.svg/60px-Flag_of_Mali.svg.png',
    streamUrl: 'http://69.64.57.208/cherifla/playlist.m3u8',
    backupUrl:  'http://69.64.57.208/cherifla/playlist.m3u8',
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
    backupUrl: 'http://69.64.57.208/rti1/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'rti2',
    name: 'RTI 2',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'http://69.64.57.208/rti2/playlist.m3u8',
    backupUrl: 'http://69.64.57.208/rti2/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'rti-la3',
    name: 'RTI La 3',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/0/02/RTI_1_logo_2014.png/120px-RTI_1_logo_2014.png',
    streamUrl: 'http://69.64.57.208/la3/playlist.m3u8',
    category: "Côte d'Ivoire",
    country: "Côte d'Ivoire",
    language: 'French',
  },
  {
    id: 'nci',
    name: 'NCI',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/2/27/Logo_NCI.png/120px-Logo_NCI.png',
    streamUrl: 'http://69.64.57.208/nci/playlist.m3u8',
    backupUrl: 'http://69.64.57.208/nci/playlist.m3u8',
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
    streamUrl: 'http://69.64.57.208/telesahel/playlist.m3u8',
    backupUrl: 'http://69.64.57.208/telesahel/playlist.m3u8',
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
    streamUrl: 'https://stream-lb.livemediama.com/alaoula/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic/French',
  },
  {
    id: '2m-maroc',
    name: '2M Maroc',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/2M_Maroc_Logo.svg/120px-2M_Maroc_Logo.svg.png',
    streamUrl: 'https://stream-lb.livemediama.com/2m/hls/master.m3u8',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic/French',
  },
  {
    id: 'arryadia',
    name: 'Arryadia Sport',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Arryadia_Logo.svg/120px-Arryadia_Logo.svg.png',
    streamUrl: 'https://stream-lb.livemediama.com/arryadia/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic',
  },
  {
    id: 'al-maghribia',
    name: 'Al Maghribia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Logo_AlMaghribia.svg/120px-Logo_AlMaghribia.svg.png',
    streamUrl: 'https://stream-lb.livemediama.com/almaghribia/hls/master.m3u8',
    referer: 'https://snrtlive.ma/',
    category: 'Morocco',
    country: 'Maroc',
    language: 'Arabic',
  },

  // ══════════════════════════════════════════════
  //  🇫🇷  FRANCE
  // ══════════════════════════════════════════════
  {
    id: 'france2',
    name: 'France 2',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/France_2_logo.svg/120px-France_2_logo.svg.png',
    streamUrl: 'http://69.64.57.208/france2/playlist.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'tv5monde',
    name: 'TV5Monde Afrique',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/TV5Monde_Logo.svg/120px-TV5Monde_Logo.svg.png',
    streamUrl: 'https://liveh12.vtvprime.vn/hls/TV5/03.m3u8',
    backupUrl: 'https://ott.tv5monde.com/Content/HLS/Live/channel(afrique)/variant.m3u8',
    category: 'France',
    country: 'France / Afrique',
    language: 'French',
  },
  {
    id: 'france24-fr',
    name: 'France 24 Français',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/France_24_logo_%282013%29.svg/120px-France_24_logo_%282013%29.svg.png',
    streamUrl: 'https://live.france24.com/hls/live/2037179-b/F24_FR_HI_HLS/master_2300.m3u8',
    category: 'France',
    country: 'France',
    language: 'French',
  },
  {
    id: 'france24-en',
    name: 'France 24 English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/France_24_logo_%282013%29.svg/120px-France_24_logo_%282013%29.svg.png',
    streamUrl: 'https://live.france24.com/hls/live/2037218-b/F24_EN_HI_HLS/master_2300.m3u8',
    category: 'France',
    country: 'France',
    language: 'English',
  },

  {
    id: 'france5',
    name: 'France 5',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/La_Cinqui%C3%A8me_1999.svg/120px-La_Cinqui%C3%A8me_1999.svg.png',
    streamUrl: 'http://69.64.57.208/france5/playlist.m3u8',
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
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/6/6a/Logo_Africa_24.jpg/120px-Logo_Africa_24.jpg',
    streamUrl: 'https://africa24.vedge.infomaniak.com/livecast/ik:africa24sport/manifest.m3u8',
    category: 'France',
    country: 'Afrique',
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/TRT_World_logo.svg/120px-TRT_World_logo.svg.png',
    streamUrl: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
    category: 'News',
    country: 'Turkey',
    language: 'English',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/120px-Aljazeera_eng.svg.png',
    streamUrl: 'https://live-hls-apps-aje.getaj.net/AJE/index.m3u8',
    category: 'News',
    country: 'International',
    language: 'English',
  },
  {
    id: 'africa24-fr',
    name: 'Africa24 FR',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/6/6a/Logo_Africa_24.jpg/120px-Logo_Africa_24.jpg',
    streamUrl: 'https://africa24.vedge.infomaniak.com/livecast/ik:africa24/manifest.m3u8',
    category: 'News',
    country: 'Afrique',
    language: 'French',
  },
  {
    id: 'africa24-en',
    name: 'Africa24 EN',
    logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/6/6a/Logo_Africa_24.jpg/120px-Logo_Africa_24.jpg',
    streamUrl: 'https://edge20.vedge.infomaniak.com/livecast/ik:africa24english/manifest.m3u8',
    category: 'News',
    country: 'Afrique',
    language: 'English',
  },
  {
    id: 'bbc-news',
    name: 'BBC News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/BBC_News_2019.svg/120px-BBC_News_2019.svg.png',
    streamUrl: 'https://vs-hls-push-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_news_channel_hd/mobile_wifi_main_hd_abr_v2.m3u8',
    category: 'News',
    country: 'United Kingdom',
    language: 'English',
  },
  {
    id: 'sky-news-au',
    name: 'Sky News Australia',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/15/Former_Sky_News_Australia_logo.png/120px-Former_Sky_News_Australia_logo.png',
    streamUrl: 'https://skynewsau-live.akamaized.net/hls/live/2002691/skynewsau-extra3/master.m3u8',
    category: 'News',
    country: 'Australia',
    language: 'English',
  },
  {
    id: 'bloomberg-tv',
    name: 'Bloomberg TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Bloomberg_logo.svg/120px-Bloomberg_logo.svg.png',
    streamUrl: 'https://d2d98ykcmmhgd4.cloudfront.net/v1/bloomberg_bloombergtv_2/samsungheadend_us/latest/main/hls/playlist.m3u8',
    category: 'News',
    country: 'United States',
    language: 'English',
  },
  {
    id: 'nhk-world',
    name: 'NHK World Japan',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/NHK_World_Logo.svg/120px-NHK_World_Logo.svg.png',
    streamUrl: 'https://masterpl.hls.nhkworld.jp/hls/w/live/smarttv.m3u8',
    direct: true,
    category: 'News',
    country: 'Japan',
    language: 'English',
  },
  {
    id: 'cgtn-en',
    name: 'CGTN English',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/CGTN_logo.svg/120px-CGTN_logo.svg.png',
    streamUrl: 'https://amg00405-rakutentv-cgtn-rakuten-i9tar.amagi.tv/master.m3u8',
    category: 'News',
    country: 'China',
    language: 'English',
  },
  {
    id: 'cgtn-fr',
    name: 'CGTN Français',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/CGTN_logo.svg/120px-CGTN_logo.svg.png',
    streamUrl: 'https://amg01314-cgtn-amg01314c2-rakuten-us-1319.playouts.now.amagi.tv/cgtn-fr-rakuten/playlist.m3u8',
    category: 'News',
    country: 'China',
    language: 'French',
  },
  {
    id: 'africanews-fr',
    name: 'Africanews FR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Africanews.svg/120px-Africanews.svg.png',
    streamUrl: 'https://cdn-euronews.akamaized.net/live/eds/africanews-fr/25050/index.m3u8',
    category: 'News',
    country: 'Afrique',
    language: 'French',
  },

  // ══════════════════════════════════════════════
  //  🇧🇫  BURKINA FASO
  // ══════════════════════════════════════════════
  {
    id: 'rtb-bf',
    name: 'RTB Burkina',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/60px-Flag_of_Burkina_Faso.svg.png',
    streamUrl: 'http://69.64.57.208/rtb/playlist.m3u8',
    backupUrl: 'http://69.64.57.208/rtb/playlist.m3u8',
    category: 'Burkina Faso',
    country: 'Burkina Faso',
    language: 'French',
  },
  {
    id: 'burkina-info-tv',
    name: 'Burkina Info TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Burkina_Faso.svg/60px-Flag_of_Burkina_Faso.svg.png',
    streamUrl: 'http://69.64.57.208/burkinainfo/playlist.m3u8',
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
    streamUrl: 'http://69.64.57.208/ortb/playlist.m3u8',
    backupUrl: 'http://69.64.57.208/ortb/playlist.m3u8',
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
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/CityNews_logo.svg/120px-CityNews_logo.svg.png',
    streamUrl: 'https://citynewsregional.akamaized.net/hls/live/1024052/Regional_Live_7/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'citynews-calgary',
    name: 'CityNews Calgary',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/CityNews_logo.svg/120px-CityNews_logo.svg.png',
    streamUrl: 'https://citynewsregional.akamaized.net/hls/live/1024053/Regional_Live_8/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'citynews-vancouver',
    name: 'CityNews Vancouver',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/CityNews_logo.svg/120px-CityNews_logo.svg.png',
    streamUrl: 'https://citynewsregional.akamaized.net/hls/live/1024054/Regional_Live_9/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'ici-rdi',
    name: 'ICI RDI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/ICI_RDI_logo.svg/120px-ICI_RDI_logo.svg.png',
    streamUrl: 'https://rcavlive.akamaized.net/hls/live/704025/xcanrdi/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'French',
  },
  {
    id: 'ici-montreal',
    name: 'ICI Montréal',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/CBC_Radio-Canada_logo.svg/120px-CBC_Radio-Canada_logo.svg.png',
    streamUrl: 'https://amdici.akamaized.net/hls/live/873426/ICI-Live-Stream/master.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'French',
  },
  {
    id: 'ntd-canada',
    name: 'NTD Canada',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/NTD_Logo_with_symbol.svg/120px-NTD_Logo_with_symbol.svg.png',
    streamUrl: 'https://live.ntdtv.com/mllive860/playlist.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'tsn-the-ocho',
    name: 'TSN The Ocho',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/TSN_logo_%28original%29.svg/120px-TSN_logo_%28original%29.svg.png',
    streamUrl: 'https://d3pnbvng3bx2nj.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-rds8g35qfqrnv/TSN_The_Ocho.m3u8',
    category: 'Canada',
    country: 'Canada',
    language: 'English',
  },
  {
    id: 'willow-sports',
    name: 'Willow Sports',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg/60px-Flag_of_the_United_States_%28DoS_ECA_Color_Standard%29.svg.png',
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

  // ══════════════════════════════════════════════
  //  🇬🇭  GHANA
  // ══════════════════════════════════════════════
  {
    id: 'gtv-ghana',
    name: 'GTV',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/GTV_logo.png/120px-GTV_logo.png',
    streamUrl: 'http://69.64.57.208/gtv/playlist.m3u8',
    category: 'Ghana',
    country: 'Ghana',
    language: 'English',
  },
  {
    id: 'joynews-ghana',
    name: 'Joy News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/60px-Flag_of_Ghana.svg.png',
    streamUrl: 'http://69.64.57.208/joynews/playlist.m3u8',
    category: 'Ghana',
    country: 'Ghana',
    language: 'English',
  },
  {
    id: 'adomtv-ghana',
    name: 'Adom TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/60px-Flag_of_Ghana.svg.png',
    streamUrl: 'http://69.64.57.208/adomtv/playlist.m3u8',
    category: 'Ghana',
    country: 'Ghana',
    language: 'Twi/English',
  },

  // ══════════════════════════════════════════════
  //  🇳🇬  NIGERIA
  // ══════════════════════════════════════════════
  {
    id: 'tvc-news-ng',
    name: 'TVC News',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Flag_of_Nigeria.svg/60px-Flag_of_Nigeria.svg.png',
    streamUrl: 'http://69.64.57.208/tvcnews/playlist.m3u8',
    youtubeChannelId: 'UCNO6nJ6kydLEgfXRiRr24Ag',
    category: 'Nigeria',
    country: 'Nigeria',
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
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Aljazeera_eng.svg/120px-Aljazeera_eng.svg.png',
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

  // ══════════════════════════════════════════════
  //  🇬🇲  GAMBIA
  // ══════════════════════════════════════════════
  {
    id: 'grts-gambia',
    name: 'GRTS',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_The_Gambia.svg/60px-Flag_of_The_Gambia.svg.png',
    streamUrl: 'http://69.64.57.208/grts/playlist.m3u8',
    category: 'Gambia',
    country: 'Gambia',
    language: 'English',
  },
  {
    id: 'qtv-gambia',
    name: 'QTV Gambia',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_The_Gambia.svg/60px-Flag_of_The_Gambia.svg.png',
    streamUrl: 'https://player.qtv.gm/hls/live.stream.m3u8',
    direct: true,
    category: 'Gambia',
    country: 'Gambia',
    language: 'English',
  },

  // ══════════════════════════════════════════════
  //  🇬🇼  GUINEA-BISSAU
  // ══════════════════════════════════════════════

  // ══════════════════════════════════════════════
  //  🇸🇱  SIERRA LEONE
  // ══════════════════════════════════════════════

  // ══════════════════════════════════════════════
  //  🇪🇹  ETHIOPIA
  // ══════════════════════════════════════════════
  {
    id: 'ebs-ethiopia',
    name: 'EBS TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/60px-Flag_of_Ethiopia.svg.png',
    streamUrl: 'https://rpn.bozztv.com/ebstv/ebstv/index.m3u8',
    category: 'Ethiopia',
    country: 'Ethiopia',
    language: 'Amharic',
  },
  {
    id: 'ebs-cinema',
    name: 'EBS Cinema',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/60px-Flag_of_Ethiopia.svg.png',
    streamUrl: 'https://rpn.bozztv.com/ebstv/ebscinema/index.m3u8',
    category: 'Ethiopia',
    country: 'Ethiopia',
    language: 'Amharic',
  },
  {
    id: 'ebs-musika',
    name: 'EBS Musika',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/60px-Flag_of_Ethiopia.svg.png',
    streamUrl: 'https://rpn.bozztv.com/ebstv/ebsmusika/index.m3u8',
    category: 'Ethiopia',
    country: 'Ethiopia',
    language: 'Amharic',
  },

  // ══════════════════════════════════════════════
  //  🇹🇿  TANZANIA
  // ══════════════════════════════════════════════
  {
    id: 'tbc1-tanzania',
    name: 'TBC 1',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tanzania.svg/60px-Flag_of_Tanzania.svg.png',
    streamUrl: 'https://stream-134630.castr.net/5fe35eae8c53540cab83659a/live_f9bd5b30323411f0a32aaf26f944974f/index.fmp4.m3u8',
    direct: true,
    category: 'Tanzania',
    country: 'Tanzania',
    language: 'Swahili',
  },
  {
    id: 'tbc2-tanzania',
    name: 'TBC 2',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Flag_of_Tanzania.svg/60px-Flag_of_Tanzania.svg.png',
    streamUrl: 'https://stream-134630.castr.net/5fe35eae8c53540cab83659a/live_17ad3c50323511f08f79733d2dd68583/index.fmp4.m3u8',
    direct: true,
    category: 'Tanzania',
    country: 'Tanzania',
    language: 'Swahili',
  },

  // ══════════════════════════════════════════════
  //  🇪🇬  EGYPT
  // ══════════════════════════════════════════════
  {
    id: 'mbc-masr',
    name: 'MBC Masr',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/60px-Flag_of_Egypt.svg.png',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8',
    direct: true,
    category: 'Egypt',
    country: 'Egypt',
    language: 'Arabic',
  },
  {
    id: 'mbc-masr2',
    name: 'MBC Masr 2',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/60px-Flag_of_Egypt.svg.png',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-2/754931856515075b0aabf0e583495c68/index.m3u8',
    direct: true,
    category: 'Egypt',
    country: 'Egypt',
    language: 'Arabic',
  },
  {
    id: 'mbc-masr-drama',
    name: 'MBC Masr Drama',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/60px-Flag_of_Egypt.svg.png',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-drama/567b703c19ede6598222de81b0e4508b/index.m3u8',
    direct: true,
    category: 'Egypt',
    country: 'Egypt',
    language: 'Arabic',
  },
  {
    id: 'dmc-egypt',
    name: 'DMC TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/60px-Flag_of_Egypt.svg.png',
    streamUrl: 'https://srvx1.selftv.video/dmchannel/live/playlist.m3u8',
    direct: true,
    category: 'Egypt',
    country: 'Egypt',
    language: 'Arabic',
  },
  {
    id: 'algahd-egypt',
    name: 'Al Ghad TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/60px-Flag_of_Egypt.svg.png',
    streamUrl: 'https://eazyvwqssi.erbvr.com/alghadtv/alghadtv.m3u8',
    category: 'Egypt',
    country: 'Egypt',
    language: 'Arabic',
  },
  {
    id: 'nogoum-egypt',
    name: 'Nogoum FM TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Egypt.svg/60px-Flag_of_Egypt.svg.png',
    streamUrl: 'https://nogoumtv.nrpstream.com/hls/stream.m3u8',
    direct: true,
    category: 'Egypt',
    country: 'Egypt',
    language: 'Arabic',
  },

  // ══════════════════════════════════════════════
  //  🇹🇳  TUNISIA
  // ══════════════════════════════════════════════
  {
    id: 'mosaique-tn',
    name: 'Mosaique FM TV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Tunisia.svg/60px-Flag_of_Tunisia.svg.png',
    streamUrl: 'https://webcam.mosaiquefm.net/mosatv/_definst_/studio/playlist.m3u8?DVR',
    direct: true,
    category: 'Tunisia',
    country: 'Tunisia',
    language: 'Arabic',
  },
];
