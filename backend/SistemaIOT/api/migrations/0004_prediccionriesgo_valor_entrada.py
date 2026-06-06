# Generated manually for dashboard prediction support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_recurso_rolrecurso'),
    ]

    operations = [
        migrations.AddField(
            model_name='prediccionriesgo',
            name='valor_entrada',
            field=models.FloatField(default=0),
        ),
    ]
