# NutriPix Website

NutriPix'in Next.js ile hazırlanan tanıtım sitesi. Proje GitHub Pages için tam
statik çıktı üretir ve `main` dalına gönderilen her değişiklik GitHub Actions
üzerinden otomatik olarak yayınlanır.

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini açın.

## Statik build

```bash
npm run build
```

Çıktı `out/` klasörüne yazılır. GitHub Pages alt yolunu geliştirme sunucusunda
doğrulamak için:

```bash
NEXT_PUBLIC_BASE_PATH=/nutripix-web npm run dev
```

Ardından `http://localhost:3000/nutripix-web/` adresini açın.

## GitHub Pages

Dağıtım akışı `.github/workflows/deploy-pages.yml` dosyasındadır. Depoda bir kez
`Settings → Pages → Build and deployment → Source: GitHub Actions` seçilmelidir.
Sonraki `main` push'ları otomatik yayınlanır.

Test adresi: [https://monligstudio.github.io/nutripix-web/](https://monligstudio.github.io/nutripix-web/)
