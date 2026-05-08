Add-Type -AssemblyName System.speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.SetOutputToWaveFile($args[0])
$speak.Speak($args[1])
$speak.Dispose()
