from mongoengine import Document, StringField, ListField, DateTimeField, connect
import datetime

connect("mongodb+srv://sai:sai147.k@cluster0.gq2sdzw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Replace 'your_database_name' with your actual database name

class Detection(Document):
    text = StringField(required=True)
    bbox = ListField()
    timestamp = DateTimeField(default=datetime.datetime.utcnow)

    def save(self, *args, **kwargs):
        super(Detection, self).save(*args, **kwargs)
