const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Premium Vehicles" },
  { value: "15+", label: "Years Experience" },
  { value: "98%", label: "Satisfaction Rate" },
];

export const Stats = () => {
  return (
    <section className="py-20 px-4 bg-hero-gradient">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-primary-foreground/80 text-sm md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
