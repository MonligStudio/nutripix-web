import type { Metadata } from "next";
import LegalLayout, { Article, Bullets, Table } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "NutriPix hangi verileri topluyor, neden topluyor ve nasıl koruyor? Verilerinizi silme ve dışa aktarma haklarınız dahil tüm detaylar.",
};

export default function GizlilikPage() {
  return (
    <LegalLayout
      title="Gizlilik Politikası"
      updated="24 Temmuz 2026"
      intro="NutriPix'i kullanırken paylaştığın verilerin ne olduğu, neden istendiği ve nasıl korunduğu bu sayfada açıkça yazıyor. Kısacası: sadece uygulamanın çalışması için gereken veriyi alıyoruz, yemek fotoğrafların analiz sonrası saklanmıyor ve hesabını dilediğin an kalıcı olarak silebiliyorsun."
    >
      <Article n="01" title="Toplanan bilgiler">
        <p>NutriPix, hizmeti sunabilmek için aşağıdaki bilgileri toplayabilir:</p>
        <Table
          head={["Bilgi türü", "Toplanma amacı"]}
          rows={[
            ["E-posta adresi", "Hesap oluşturma ve giriş"],
            ["Boy, kilo, yaş, cinsiyet", "Kişiselleştirilmiş kalori ve makro hedefleri"],
            ["Yemek fotoğrafları", "AI besin analizi (işlendikten sonra silinir)"],
            ["Beslenme günlüğü verileri", "Günlük takip ve geçmiş görüntüleme"],
            ["Kilo ve su kayıtları", "İlerleme grafikleri"],
            ["Abonelik bilgisi", "Premium erişiminin yönetimi"],
            ["Reklam kimliği (AD_ID)", "Ücretsiz sürümde reklam gösterimi"],
            ["Cihaz ve etkileşim verileri", "Hata ayıklama ve performans ölçümü"],
          ]}
        />
      </Article>

      <Article n="02" title="Bilgilerin kullanımı">
        <Bullets
          items={[
            "AI analizi: Yemek fotoğrafların, besin değerlerini tahmin etmek üzere Google Gemini ve DeepSeek servislerine iletilir. Fotoğraflar analiz sonrasında saklanmaz.",
            "Hesap yönetimi: E-posta adresin yalnızca giriş ve hesap kurtarma için kullanılır.",
            "Kişiselleştirme: Vücut bilgilerin, sana özel kalori ve makro hedefleri hesaplamak için kullanılır.",
            "Reklam: Ücretsiz sürümde reklam ağı, kişiselleştirilmiş reklam göstermek için reklam kimliğini ve cihaz bilgilerini kullanabilir. Premium aboneliğinde reklam gösterilmez.",
          ]}
        />
      </Article>

      <Article n="03" title="Üçüncü taraf servisler">
        <p>NutriPix, aşağıdaki servisleri kullanır ve bu servislerin kendi gizlilik politikaları geçerlidir:</p>
        <Table
          head={["Servis", "Kullanım amacı"]}
          rows={[
            ["Google Gemini", "Yemek fotoğrafı analizi"],
            ["DeepSeek", "Besin içeriğinin detaylandırılması"],
            ["Supabase", "Hesap ve veri depolama"],
            ["RevenueCat", "Abonelik yönetimi"],
            ["Google AdMob", "Ücretsiz sürümde reklam gösterimi"],
            ["Google Sign-In", "Google ile giriş (isteğe bağlı)"],
            ["Open Food Facts", "Barkodlu ürünlerin besin değerleri"],
          ]}
        />
      </Article>

      <Article n="04" title="Veri güvenliği">
        <Bullets
          items={[
            "Tüm veriler şifreli bağlantı (HTTPS/SSL) üzerinden iletilir.",
            "Şifreler hash'lenerek saklanır; hiçbir zaman düz metin olarak tutulmaz.",
            "Yemek fotoğrafları, analiz tamamlandıktan hemen sonra AI sunucularından silinir.",
          ]}
        />
      </Article>

      <Article n="05" title="Veri saklama süresi">
        <Bullets
          items={[
            "Hesap verilerin, hesabın aktif olduğu sürece saklanır.",
            "Hesabını sildiğinde tüm verilerin 30 gün içinde kalıcı olarak silinir.",
            "AI analiz geçmişi (fotoğrafsız, yalnızca besin değerleri) hesabınla birlikte saklanır.",
          ]}
        />
      </Article>

      <Article id="veri-silme" n="06" title="Kullanıcı hakları ve veri silme">
        <Bullets
          items={[
            "Hesabını ve tüm verilerini uygulama içinden silebilirsin: Ayarlar › Hesabı Sil.",
            "Verilerinin bir kopyasını talep edebilir, dışa aktarabilirsin.",
            "Aboneliğini dilediğin an iptal edebilirsin.",
            "Uygulamaya erişemiyorsan, hesabında kayıtlı e-posta adresinden bize yazarak silme talebi oluşturabilirsin; talebin 30 gün içinde sonuçlandırılır.",
          ]}
        />
      </Article>

      <Article n="07" title="Çocukların gizliliği">
        <p>
          NutriPix, 13 yaşın altındaki çocuklara yönelik değildir. 13 yaş altı kullanıcılardan
          bilerek veri toplamayız. Böyle bir veri toplandığını fark edersek gecikmeksizin
          sileriz.
        </p>
      </Article>

      <Article n="08" title="Değişiklikler">
        <p>
          Bu gizlilik politikası güncellendiğinde değişiklikler bu sayfada yayımlanır ve önemli
          değişiklikler uygulama içinde bildirilir. Sayfanın başındaki &ldquo;son
          güncelleme&rdquo; tarihi her zaman geçerli sürümü gösterir.
        </p>
      </Article>
    </LegalLayout>
  );
}
