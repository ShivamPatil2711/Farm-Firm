import {
  Leaf,
  Send,
  IndianRupee,
  Handshake,
  Network,
  BarChart3,
} from "lucide-react";
const FeatureSection = () => {
 const features = [
  {
    icon: Leaf,
    title: "Direct Farm-to-Firm Deals",
    description: "Cut out middlemen and connect directly with buyers and sellers for faster, more profitable trades.",
  },
  {
    icon: Send,
    title: "Smart Request System",
    description: "Firms send requests, farmers decide. Full control to accept, reject, or negotiate deals your way.",
  },
  {
    icon: IndianRupee,
    title: "Competitive Bidding",
    description: "Reach multiple farmers at once, receive quotes, and choose the best deal without hassle.",
  },
  {
    icon: Handshake,
    title: "Trusted Network Insights",
    description: "See which farmers or firms your connections already work with before making a decision.",
  },
  {
    icon: Network,
    title: "Build Your Trade Network",
    description: "Add and manage connections to create a reliable circle of farmers and business partners.",
  },
  {
    icon: BarChart3,
    title: "Actionable Dashboards",
    description: "Track requests, deals, and earnings with clean dashboards designed for both farmers and firms.",
  },
];
  return (
    <section className="py-20 md:py-24 bg-gray-50">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Everything You Need for{" "}
            <span className="text-emerald-600">Seamless Trade</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our platform provides all the tools farmers and firms need to connect,
            negotiate, and transact with confidence.
          </p>
        </div>
        {console.log(features)}
        <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-xl hover:shadow-emerald-100/40 hover:border-emerald-200 transition-all duration-300"
              style={{
                animationDelay: `${index * 0.08}s`,
                animation: "fadeInUp 0.7s forwards",
              }}
            >
          <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-300">
  <feature.icon className="w-6 h-6 text-emerald-600 group-hover:text-white" />
</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;