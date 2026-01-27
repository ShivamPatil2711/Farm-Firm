const FeatureSection = () => {
  const features = [
  {
    icon: "📍",
    title: "Location-Based Search",
    description: "Find farmers near you to reduce transportation costs and support local trade.",
  },
  {
    icon: "📈",
    title: "Real-Time Pricing",
    description: "Live crop prices updated dynamically based on market trends and listings.",
  },
  {
    icon: "⚖️",
    title: "Price Comparison",
    description: "Compare prices across multiple farmers with advanced filtering options.",
  },
  {
    icon: "📦",
    title: "Crop Listings",
    description: "Detailed crop information including quality, quantity, and availability.",
  },
  {
    icon: "🧾",
    title: "Transaction History",
    description: "Complete records of all transactions for transparency and trust.",
  },
  {
    icon: "📊",
    title: "Smart Dashboards",
    description: "Role-based dashboards with analytics, earnings, and spending insights.",
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
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 text-3xl group-hover:bg-emerald-600 group-hover:scale-110 group-hover:text-white transition-all duration-300">
                {feature.icon}
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