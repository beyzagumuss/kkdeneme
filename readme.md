docker compose logs -f app  //log goruntuleme 
# API çalışıyor mu test et
curl http://localhost:3000/health

# Kafka hazır mı kontrol et
docker compose logs kafka | grep "started"
Eğer Kafka'da [KafkaServer id=1] started yazısını görüyorsan, Kafka hazır demektir. O zaman:
# Kafka hazır olunca app'i yeniden başlat
docker compose restart app





1. Eski container'ları temizle
docker compose down
2. Yeni imajları çek ve başlat
docker compose up -d
(--build gerekmez çünkü sadece imaj değişti, kod değişmedi)
3. Kafka'nın başladığını kontrol et
docker compose logs kafka | grep "started"
[KafkaServer id=1] started görmelisin.
4. App'i yeniden başlat (Kafka hazır olsun)
docker compose restart app
5. CRUD + Kafka testi
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali","email":"ali@test.com","message":"merhaba"}'


docker compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic user-events \
  --from-beginning



docker compose exec postgres psql -U beyzauser -d hello_db -c "SELECT * FROM users;"