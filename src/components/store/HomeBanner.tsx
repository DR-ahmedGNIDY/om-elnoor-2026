import Image from "next/image";

export default function HomeBanner() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/images/banner.png"
            alt="كوكي هوم"
            width={1366}
            height={768}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}