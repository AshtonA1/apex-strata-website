import { Compass, Hammer, TrendingUp, ShieldCheck, BookOpen, AlertTriangle, Layers, FileSearch, Cpu, Zap, FileCheck2, Users, Award, Scale } from "lucide-react";
import serviceCoreLogging from "@/assets/images/service-core-logging.png";
import serviceRapidAssessment from "@/assets/images/service-rapid-assessment.png";
import serviceGroundControl from "@/assets/images/service-ground-control.png";
import serviceRiskFramework from "@/assets/images/service-risk-framework.png";
import serviceTraining from "@/assets/images/service-training.png";
import serviceTsfReview from "@/assets/images/service-tsf-review.png";
import coreSamples from "@/assets/images/core-samples.png";
import rockTexture from "@/assets/images/rock-texture.png";
import logoAlpha from "@/assets/clients/alpha-minerals.png";
import logoKavango from "@/assets/clients/kavango-resources.png";
import logoBitumen from "@/assets/clients/bitumen-world-mining.png";

// ---------------------------------------------------------------------------
// NAVIGATION
// ---------------------------------------------------------------------------
export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Projects", path: "/projects" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

// ---------------------------------------------------------------------------
// SERVICES
// Reconciled from the live site + the Apex Strata Consulting Portfolio deck.
// TODO(Ashton): "Advanced Numerical Modelling" and "Third-Party Audits" are
// using reused stock imagery (no dedicated photo exists yet) - swap
// `image` for a real photo when you have one.
// ---------------------------------------------------------------------------
export const SERVICES = [
  {
    icon: Compass,
    title: "Geotechnical Investigations & Core Logging",
    desc: "Comprehensive site investigations, soil profiling, structural data evaluation, and geotechnical core logging.",
    image: serviceCoreLogging,
    includes: [
      "Detailed geotechnical core logging (RQD, Q-system, RMR)",
      "Structural mapping and kinematic analysis",
      "Soil profiling and material characterization",
      "In-situ testing supervision and data interpretation",
      "Comprehensive baseline geotechnical reports",
    ],
    engagement: "Typically a 2-4 week field deployment followed by a detailed factual reporting phase.",
  },
  {
    icon: TrendingUp,
    title: "Geotechnical Assessments",
    desc: "Rapid-deployment baseline and minewide assessments of ground conditions, hazard identification, and operational stability for underground and surface mines.",
    image: serviceRapidAssessment,
    includes: [
      "High-level site walkovers and visual inspections",
      "Minewide geotechnical assessments (underground & surface)",
      "Identification of immediate stability hazards",
      "Preliminary rock mass classification",
      "Actionable short-term stability recommendations",
    ],
    engagement: "Typically a 3-5 day rapid site visit with immediate debriefing and a concise findings memo.",
  },
  {
    icon: Layers,
    title: "Advanced Numerical Modelling",
    desc: "Advanced 2D and 3D geotechnical modelling to simulate ground behaviour, assess support performance, and evaluate design scenarios under varying conditions.",
    image: coreSamples,
    includes: [
      "2D and 3D numerical modelling (RS2, RS3, FLAC3D, MAP3D)",
      "Support performance simulation",
      "Design scenario evaluation under varying ground conditions",
      "Risk reduction through predictive analysis",
    ],
    engagement: "Scoped per project; typically runs alongside a design or review engagement.",
  },
  {
    icon: Hammer,
    title: "Practical Ground Control Recommendations",
    desc: "Clear designs for underground development (support systems, extraction sequencing) and open-pit mining (slope stability, kinematic analysis).",
    image: serviceGroundControl,
    includes: [
      "Empirical and numerical support design (rockbolts, mesh, shotcrete)",
      "Pillar sizing and extraction sequencing strategies",
      "Open pit bench and overall slope angle design",
      "Kinematic analysis for structurally controlled failures",
      "Review of blasting practices on wall control",
    ],
    engagement: "Project-based design packages ranging from 2 weeks to 2 months depending on complexity.",
  },
  {
    icon: ShieldCheck,
    title: "Ground Control Frameworks & Risk Management",
    desc: "Develop standards from the ground up, including Bowtie analysis, Fatal Risk Control Protocols, and Ground Control Management Plans (GCMPs).",
    image: serviceRiskFramework,
    includes: [
      "Development of Ground Control Management Plans (GCMPs)",
      "Facilitation of Bowtie risk assessments for major hazards",
      "Drafting of Principal Hazard Management Plans (PHMPs)",
      "Creation of Standard Operating Procedures (SOPs) for ground support",
      "Code of Practice development",
    ],
    engagement: "Collaborative 1-3 month engagements working closely with site safety and technical teams.",
  },
  {
    icon: BookOpen,
    title: "On-Site Personnel Training",
    desc: "Hands-on workshops to empower mine workers and supervisors with fundamental rock mass characterization and hazard identification skills.",
    image: serviceTraining,
    includes: [
      "Basic rock mechanics principles for operators",
      "Hazard identification (loose rock, structural wedges, water inflow)",
      "Ground support installation quality control",
      "Reading and interpreting ground behavior and monitoring data",
      "Tailored curriculum based on site-specific conditions",
    ],
    engagement: "1-3 day interactive workshops delivered on-site to shift crews and line management.",
  },
  {
    icon: AlertTriangle,
    title: "TSF & Heap Leach Facility Reviews",
    desc: "Independent post-design assessments, seepage analysis, and advanced slope stability modeling for Tailings Storage Facilities and heap leach pads.",
    image: serviceTsfReview,
    includes: [
      "Independent third-party review of TSF and heap leach pad designs",
      "Slope stability analysis (limit equilibrium and numerical methods)",
      "Seepage and groundwater flow modeling",
      "Review of instrumentation and monitoring data",
      "Compliance checks against international standards (GISTM)",
    ],
    engagement: "Comprehensive design review packages typically spanning 4-6 weeks.",
  },
  {
    icon: FileSearch,
    title: "Third-Party Audits & Design Reviews",
    desc: "Objective audits and review of existing geotechnical designs to validate input parameters and assumptions, identify gaps, and recommend practical improvements.",
    image: rockTexture,
    includes: [
      "Independent review of existing geotechnical designs",
      "Validation of input parameters and modelling assumptions",
      "Gap identification against best practice and standards",
      "Practical, implementable improvement recommendations",
    ],
    engagement: "Typically a 2-4 week independent review, delivered as a standalone report.",
  },
];

// ---------------------------------------------------------------------------
// PROJECTS
// Sourced from the Apex Strata Consulting Portfolio deck's "Key Projects
// Overview" slide. All listed as Completed since the deck doesn't specify
// otherwise - change `status` to "Ongoing" or "Pending" for live work, and
// add new entries to this array as they come up (this is the data source
// for the Projects page).
// ---------------------------------------------------------------------------
export type ProjectStatus = "Completed" | "Ongoing" | "Pending";

export const PROJECTS: {
  title: string;
  client: string;
  /** Names matching entries in CLIENTS (logo + link come from there). Anything
   *  not in CLIENTS renders as a text chip. "Confidential Client" renders with a lock. */
  clients: string[];
  location: string;
  status: ProjectStatus;
  desc: string;
}[] = [
  {
    title: "Geotechnical Design for Five Open Pits",
    client: "Royal Family Mine (Podhill)",
    clients: ["Royal Family Mine"],
    location: "Filabusi, Zimbabwe",
    status: "Completed",
    desc: "Geotechnical design for a five-pit open pit development at Royal Family Mine.",
  },
  {
    title: "Open Pit Slope Design",
    client: "Alpha Minerals",
    clients: ["Alpha Minerals"],
    location: "Willies Luck, Zimbabwe",
    status: "Completed",
    desc: "Slope design for an open pit operation, balancing stripping ratio against overall slope stability.",
  },
  {
    title: "Minewide Underground Geotechnical Assessment",
    client: "Old Nic Mine (Retinue Stars Investments)",
    clients: ["Old Nic Mine"],
    location: "Bulawayo, Zimbabwe",
    status: "Completed",
    desc: "Comprehensive minewide assessment of underground workings, identifying stability hazards and ground support priorities.",
  },
  {
    title: "Main Vertical Shaft Geotechnical Stability Analysis",
    client: "Kavango Zimbabwe Holdings (Pvt) Ltd",
    clients: ["Kavango Resources"],
    location: "Filabusi, Zimbabwe",
    status: "Completed",
    desc: "Stability analysis for the main vertical shaft, informing support design and operational risk controls.",
  },
  {
    title: "Open Pit Slope Design",
    client: "Bitumen World Mining",
    clients: ["Bitumen World Mining"],
    location: "Zimbabwe",
    status: "Completed",
    desc: "Slope design and kinematic analysis for open pit development.",
  },
  {
    title: "Open Pit Designs",
    client: "Unicha Gold Mine (Turnstone Resources & Sandfinder Investments)",
    clients: ["Unicha Gold Mine"],
    location: "Zimbabwe",
    status: "Completed",
    desc: "Open pit design covering bench geometry and overall slope angles for safe, productive extraction.",
  },
  {
    title: "Tailings Storage Facility (TSF) Review",
    client: "Kavango Resources (Pvt) Ltd",
    clients: ["Kavango Resources"],
    location: "Filabusi, Zimbabwe",
    status: "Completed",
    desc: "Independent geotechnical review of TSF stability and seepage conditions against international standards.",
  },
  {
    title: "Heap Leach Pad Geotechnical Designs",
    client: "Royal Family Mine, Alpha Minerals, Bitumen World Mining, Stella City Mine, Unicha Gold Mine, Turnstone Resources, Sandfinder Investments",
    clients: ["Royal Family Mine", "Alpha Minerals", "Bitumen World Mining", "Stella City Mine", "Unicha Gold Mine", "Turnstone Resources", "Sandfinder Investments"],
    location: "Zimbabwe",
    status: "Completed",
    desc: "Geotechnical designs for heap leach pads across multiple client operations.",
  },
  {
    title: "Back Analysis of Slope Failure",
    client: "Confidential Client",
    clients: ["Confidential Client"],
    location: "Zimbabwe",
    status: "Completed",
    desc: "Back analysis of a slope failure caused by tensile crack formation and subsidence, informing remedial design.",
  },
  {
    title: "Ground Control Management Plan & Code of Practice",
    client: "Confidential Client",
    clients: ["Confidential Client"],
    location: "Zimbabwe",
    status: "Completed",
    desc: "Design of a Code of Practice and Ground Control Management Plan from the ground up.",
  },
];

// ---------------------------------------------------------------------------
// CLIENTS
// Bitumen, Kavango and Old Nic are the three the client asked to feature/make
// stand out (larger tiles).
// `logo` is optional - clients without one render as a text tile. To add a
// logo later: drop the file in src/assets/clients/, import it above, and set
// `logo`. `url` (optional) makes the tile a link to the client's website.
// TODO(Ashton): logos still needed for Old Nic Mine, Unicha Gold Mine, Stella
// City Mine, Royal Family Mine and Turnstone Resources.
// ---------------------------------------------------------------------------
export const CLIENTS: {
  name: string;
  featured: boolean;
  logo?: string;
  url?: string;
}[] = [
  { name: "Bitumen World Mining", featured: true, logo: logoBitumen, url: "https://www.bitumenworld.net/" },
  { name: "Kavango Resources", featured: true, logo: logoKavango, url: "https://www.kavangoresources.com/" },
  { name: "Old Nic Mine", featured: true },
  { name: "Alpha Minerals", featured: false, logo: logoAlpha, url: "https://www.alphaminerals.com/" },
  { name: "Unicha Gold Mine", featured: false },
  { name: "Stella City Mine", featured: false },
  { name: "Royal Family Mine", featured: false },
  { name: "Turnstone Resources", featured: false },
];

// ---------------------------------------------------------------------------
// COMPANY
// Deliberately NO street address and NO personal names or personal email on the
// public site (client request). Anything placed in this file ships inside the
// public JavaScript bundle, so don't add them back here, even if a page hides them.
// ---------------------------------------------------------------------------
export const COMPANY = {
  name: "Apex Strata Consulting",
  tagline: "Delivering Practical, Data-Driven Geotechnical Solutions for Safer, Smarter Mining",
  primaryEmail: "info@apexstrataconsulting.co.zw",
};

// ---------------------------------------------------------------------------
// ABOUT: wording taken from the Apex Strata Consulting Portfolio deck
// (Company Overview, Mission & Vision, Core Values, Key Differentiators).
// ---------------------------------------------------------------------------
export const OVERVIEW =
  "Apex Strata Consulting is a specialized geotechnical engineering consultancy serving the mining and civil sectors. As a lean, agile firm, we bridge the gap between complex rock mechanics theory and practical field solutions. Our focus on small to medium-scale mining operations enables us to deliver tailored expertise that enhances safety, ensures regulatory compliance, and drives productivity improvements.";

export const MISSION =
  "Empower small- and medium-scale mines with agile, affordable, and actionable rock engineering solutions that enhance safety, compliance, and operational productivity.";

export const VISION =
  "To be Africa's leading provider of innovative, practical, and sustainable geotechnical engineering solutions driving operational excellence and long-term stability.";

export const COMMITMENT = {
  title: "Our Commitment",
  text: "We bridge complex rock mechanics and geotechnical engineering with practical field solutions, delivering data-driven assessments that translate into real-world safety and performance improvements.",
};

export const FOCUS = {
  title: "Our Focus",
  text: "Specialized expertise for small- to medium-scale mining operations, ensuring accessible geotechnical excellence without compromising on quality or rigorous engineering standards.",
};

export const VALUES = [
  { title: "Customer Focus", icon: Users, desc: "Clear, practical, tailored recommendations that translate complex geotechnical data into actionable solutions for your operations." },
  { title: "Agility", icon: Zap, desc: "Streamlined operations enabling rapid deployment, quick turnaround times, and flexible service delivery to meet your project timelines." },
  { title: "Excellence", icon: Award, desc: "Rigorous engineering standards and advanced numerical modeling ensuring safety, structural integrity, and long-term stability." },
  { title: "Integrity", icon: Scale, desc: "Transparent, ethical, data-driven assessments with fair pricing. We deliver honest evaluations you can trust." },
];

export const DIFFERENTIATORS: {
  title: string;
  icon: typeof Cpu;
  desc: string;
  /** Optional chips shown under the description. */
  tags?: string[];
}[] = [
  {
    title: "Technical Prowess",
    icon: Cpu,
    desc: "Advanced numerical modeling for precise geotechnical analysis and predictive simulations.",
    tags: ["Rocscience Suite (RS2, RS3, Dips, Unwedge, Examine2D)", "FLAC3D", "MAP3D", "FlacSlope"],
  },
  {
    title: "Agile Operations",
    icon: Zap,
    desc: "Lean organizational structure enabling rapid mobilization, quick turnaround times, and flexible service delivery to meet project demands.",
  },
  {
    title: "Client-Centric Deliverables",
    icon: FileCheck2,
    desc: "From detailed technical analysis to practical operational guides, we tailor our outputs to meet specific client needs and operational contexts.",
  },
  {
    title: "Comprehensive Expertise",
    icon: Layers,
    desc: "Full-spectrum geotechnical solutions for both surface and underground operations, backed by independent and impartial assessments.",
  },
];
