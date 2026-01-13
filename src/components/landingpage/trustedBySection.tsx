const TrustedBySection = () => {
  return (
    <div className="w-full px-6 md:px-12 lg:px-20 py-12 md:py-20">
      <section className="gradient-purple">
        <div className="container mx-auto flex flex-col items-center justify-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-12 text-center">
            <span className="text-primary">Trusted</span> By:
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl w-full">
            {/* Havilah Academy Card */}
            <div className="bg-card rounded-3xl p-12 shadow-lg border border-border/50 flex items-center justify-center min-h-[280px]">
              <div className="text-center space-y-3">
                <div className="relative mx-auto">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-4 border-slate-600">
                    <svg viewBox="0 0 60 60" className="w-16 h-16 text-white">
                      <circle cx="30" cy="15" r="4" fill="currentColor" />
                      <path
                        d="M20 35 L30 20 L40 35 L30 50 Z"
                        fill="currentColor"
                      />
                      <path
                        d="M15 45 L45 45 L45 55 L15 55 Z"
                        fill="currentColor"
                        opacity="0.7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold tracking-widest text-slate-600">
                    HAVILAH
                  </span>
                  <h3 className="text-2xl font-black text-slate-800">
                    ACADEMY
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    GROWING IN WISDOM AND STATURE
                  </p>
                </div>
              </div>
            </div>

            {/* La Vie School Card */}
            <div className="bg-card rounded-3xl p-12 shadow-lg border border-border/50 flex items-center justify-center min-h-[280px]">
              <div className="text-center space-y-3">
                <div className="relative mx-auto">
                  <div className="w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white">
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M4 12 Q12 6 20 12 Q12 18 4 12"
                            fill="currentColor"
                            opacity="0.3"
                          />
                        </svg>
                      </div>
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <div
                          className="w-8 h-6 bg-orange-600"
                          style={{
                            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-orange-600">
                    LA VIE
                  </h3>
                  <p className="text-sm font-semibold text-slate-600">
                    School of Language Studies
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Knowledge. Excellence. Imagination
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrustedBySection;
