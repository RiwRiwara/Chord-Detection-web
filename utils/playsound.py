import pygame

class PlaySound:
    def __init__(self):
        pygame.init()
        pygame.mixer.init()

    def play_wav(self, hand, chord):
        if chord in ("D", "G", "A", "E", "C", "F"):
            wav_file = f"chord-{chord}.wav"
            sound = pygame.mixer.Sound(wav_file)
            sound.play()
            
