from django.core.management.base import BaseCommand
from trips_likes.models import Destination  # Make sure this is the correct import path

class Command(BaseCommand):
    help = 'Seeds the database with initial Destinations data'

    def handle(self, *args, **options):
        optionsData = [
            {"trip_id": 1, "imageUrl": "https://images.unsplash.com/photo-1621204853432-148627f20753?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "mainText": "Baltimore"},
            {"trip_id": 2, "imageUrl": "https://66.media.tumblr.com/6fb397d822f4f9f4596dff2085b18f2e/tumblr_nzsvb4p6xS1qho82wo1_1280.jpg", "mainText": "Maine"},
            {"trip_id": 3, "imageUrl": "https://images.unsplash.com/photo-1543420803-39b826ca0469?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNtb2t5JTIwbW91bnRhaW5zfGVufDB8MHwwfHx8MA%3D%3D", "mainText": "Smoky Mountain"},
            {"trip_id": 4, "imageUrl": "https://66.media.tumblr.com/5516a22e0cdacaa85311ec3f8fd1e9ef/tumblr_o45jwvdsL11qho82wo1_1280.jpg", "mainText": "Banff"},
            {"trip_id": 5, "imageUrl": "https://images.unsplash.com/photo-1618026491511-04a68970c861?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Sm9obnMlMjBIb3BraW5zfGVufDB8fDB8fHww", "mainText": "Johns Hopkins"},
            {"trip_id": 6, "imageUrl": "https://images.unsplash.com/photo-1546436836-07a91091f160?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "mainText": "New York City"},
            {"trip_id": 7, "imageUrl": "https://images.unsplash.com/photo-1576764225594-96ad970efffa?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "mainText": "San Francisco"},
            {"trip_id": 8, "imageUrl": "https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", "mainText": "Los Angeles"}
        ]

        for option in optionsData:  # Use a different variable name here
            Destination.objects.get_or_create(
                trip_id=option["trip_id"],
                defaults={'name': option["mainText"], 'image_url': option["imageUrl"]}
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Destinations data'))
