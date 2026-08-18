import type { Metadata } from "next";
import LegalLayout, { Article, Bullets } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description:
    "NutriPix'i kullanırken geçerli olan koşullar: hesap, abonelik, iptal, yapay zekâ tahminlerinin sınırları ve sorumluluk kapsamı.",
};

export default function SartlarPage() {
  return (
    <LegalLayout
      title="Kullanım Şartları"
      updated="24 Temmuz 2026"
      intro="NutriPix'i indirerek ve kullanarak aşağıdaki şartları kabul etmiş olursun. Metni kısa ve anlaşılır tutmaya çalıştık; en önemli maddeler yapay zekâ tahminlerinin sınırları ve abonelik koşulları."
    >
      <Article n="01" title="Hizmetin tanımı">
        <p>
          NutriPix; yemek fotoğrafı, barkod, serbest metin ve manuel giriş yoluyla beslenme
          takibi yapmanı sağlayan bir mobil uygulamadır. Uygulama, kalori ve makro besin
          değerlerini <strong className="text-fg">tahmin eder</strong>; laboratuvar ölçümü veya
          tartı hassasiyetinde sonuç vermez.
        </p>
      </Article>

      <Article n="02" title="Sağlık uyarısı">
        <p>
          NutriPix bir tıbbi cihaz değildir ve tıbbi tavsiye vermez. Uygulamanın sunduğu kalori
          hedefleri, makro dağılımları ve analiz sonuçları yalnızca bilgilendirme amaçlıdır.
        </p>
        <Bullets
          items={[
            "Herhangi bir diyet, kilo verme veya kilo alma programına başlamadan önce bir hekime veya diyetisyene danışmalısın.",
            "Hamilelik, kronik hastalık, yeme bozukluğu öyküsü veya ilaç kullanımı gibi durumlarda uygulamanın önerilerine dayanarak karar verme.",
            "18 yaşından küçük kullanıcılar uygulamayı ancak veli gözetiminde kullanmalıdır.",
          ]}
        />
      </Article>

      <Article n="03" title="Hesap">
        <Bullets
          items={[
            "Hesap oluştururken doğru ve güncel bilgi vermelisin.",
            "Hesabının ve giriş bilgilerinin güvenliğinden sen sorumlusun.",
            "Bir hesabı yalnızca bir kişi kullanabilir; hesabını başkasına devredemezsin.",
            "Kurallara aykırı kullanım tespit edilirse hesabın askıya alınabilir.",
          ]}
        />
      </Article>

      <Article n="04" title="Ücretsiz deneme ve abonelik">
        <Bullets
          items={[
            "Yeni kullanıcılar için 7 günlük ücretsiz deneme sunulur; deneme süresi boyunca günlük AI fotoğraf analizi hakkı sınırlıdır.",
            "Premium abonelik aylık ₺79,99 veya yıllık ₺399,99 (aylık ₺33,33) olarak sunulur. Fiyatlara KDV dahildir.",
            "Ödeme, satın alma onaylandığında App Store veya Google Play hesabından tahsil edilir.",
            "Abonelik, dönem bitiminden en az 24 saat önce iptal edilmezse otomatik olarak yenilenir.",
            "İptal işlemi mağaza hesabının abonelikler bölümünden yapılır; iptal sonrası mevcut dönem sonuna kadar Premium erişimin devam eder.",
            "İade talepleri, uygulamanın değil ilgili mağazanın (Apple / Google) iade politikasına tabidir.",
          ]}
        />
      </Article>

      <Article n="05" title="Fiyat değişiklikleri">
        <p>
          Abonelik fiyatları değişebilir. Fiyat değişikliği yürürlüğe girmeden önce uygulama
          içinde bilgilendirilirsin ve dilersen aboneliğini iptal edebilirsin. Devam eden bir
          yıllık dönemin fiyatı, dönem boyunca değişmez.
        </p>
      </Article>

      <Article n="06" title="Kabul edilebilir kullanım">
        <Bullets
          items={[
            "Uygulamayı yasa dışı amaçlarla kullanamazsın.",
            "Servisi tersine mühendislikle çözmeye, otomatik araçlarla aşırı istek göndermeye veya güvenlik önlemlerini aşmaya çalışamazsın.",
            "AI analiz haklarını çoğaltmak amacıyla birden fazla hesap açamazsın.",
            "Başkalarına ait içeriği veya kişisel veriyi izinsiz yükleyemezsin.",
          ]}
        />
      </Article>

      <Article n="07" title="İçerik ve fikri mülkiyet">
        <p>
          Uygulamanın tasarımı, kaynak kodu, markası ve görselleri NutriPix'e aittir. Uygulamaya
          yüklediğin içerikler (fotoğraf, öğün kayıtları) sana aittir; bu içerikleri yalnızca
          hizmeti sana sunabilmek amacıyla işleriz.
        </p>
      </Article>

      <Article n="08" title="Sorumluluğun sınırı">
        <p>
          Hizmet &ldquo;olduğu gibi&rdquo; sunulur. Kesintisiz veya hatasız çalışacağı garanti
          edilmez. Yapay zekâ tahminlerinin doğruluğu, sağlanan görsel ve metnin kalitesine göre
          değişir. Uygulamanın kullanımından doğan dolaylı zararlardan NutriPix sorumlu tutulamaz.
          Sorumluluğumuz, her hâlükârda son 12 ayda ödediğin abonelik bedeliyle sınırlıdır.
        </p>
      </Article>

      <Article n="09" title="Fesih">
        <p>
          Hesabını dilediğin an uygulama içinden kalıcı olarak silebilirsin. Bu şartlara aykırı
          bir kullanım tespit edilmesi hâlinde hesabına erişimi askıya alma veya sonlandırma
          hakkımız saklıdır.
        </p>
      </Article>

      <Article n="10" title="Uygulanacak hukuk">
        <p>
          Bu şartlar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda Türkiye Cumhuriyeti
          mahkemeleri ve icra daireleri yetkilidir. Tüketici sıfatıyla sahip olduğun yasal
          haklar saklıdır.
        </p>
      </Article>

      <Article n="11" title="Değişiklikler">
        <p>
          Bu şartlar güncellendiğinde yeni sürüm bu sayfada yayımlanır. Önemli değişiklikler
          uygulama içinde bildirilir; güncellemenin ardından uygulamayı kullanmaya devam etmen
          yeni şartları kabul ettiğin anlamına gelir.
        </p>
      </Article>
    </LegalLayout>
  );
}
