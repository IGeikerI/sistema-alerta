from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_seed_estado_riesgo_backfill_alertas'),
    ]

    operations = [
        migrations.CreateModel(
            name='LecturaTiempoReal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('valor', models.FloatField()),
                ('estado', models.CharField(max_length=20)),
                ('fecha', models.DateTimeField(auto_now=True)),
                ('sensor', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.sensor')),
            ],
        ),
    ]
