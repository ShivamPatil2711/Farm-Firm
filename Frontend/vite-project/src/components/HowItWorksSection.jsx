//import farmerImage from "@/assets/farmer-portrait.jpg";

const steps = [
  {
    title: "Create Your Profile",
    description: "Sign up as a farmer or firm with your location, crops, and contact details.",
  },
  {
    title: "Discover & Connect",
    description: "Farmers list crops; firms search by location, crop type, and price range.",
  },
  {
    title: "Negotiate & Agree",
    description: "Compare prices, discuss terms, and agree on fair pricing.",
  },
  {
    title: "Complete Transaction",
    description: "Finalize the deal with complete transparency and record-keeping.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
              <img
                src={"https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybSUyMGxhbmRzY2FwZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"}
                alt="Happy farmer in field"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Info Card */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white p-5 sm:p-6 rounded-xl shadow-lg border border-gray-200 max-w-[260px] sm:max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 text-xl">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Fair Pricing</p>
                  <p className="text-sm text-gray-600">No middlemen fees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <h2 className="font-bold text-3xl md:text-4xl text-gray-900 mb-6 leading-tight">
              How It <span className="text-emerald-600">Works</span>
            </h2>

            <p className="text-lg text-gray-700 mb-10 leading-relaxed">
              Getting started is simple. Whether you're a farmer looking to sell or a firm looking to buy, 
              our platform makes agricultural trade straightforward and transparent.
            </p>

            <div className="space-y-10">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-5 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                      {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-300 mt-2 mb-[-2rem]" />
                    )}
                  </div>

                  <div className="pb-6">
                    <h3 className="font-semibold text-xl text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;