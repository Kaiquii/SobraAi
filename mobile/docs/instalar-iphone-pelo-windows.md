# SobraAi no iPhone usando Windows

Registro do procedimento realizado em **23/11/2026**, para reconstruir o ambiente
em outro PC Windows e instalar novamente no iPhone. O build completo e a instalação
funcionaram; o usuário confirmou que o app abriu e funcionou no aparelho.

Este documento registra versões e limitações daquela execução. Os comandos de
preparação em um PC novo precisam ser conferidos nesse PC; não foi feita uma
segunda instalação limpa para validar este roteiro de ponta a ponta.

## 1. Qual caminho funcionou

A pesquisa começou pelo [xtool](https://github.com/xtool-org/xtool), mas o SobraAi
é Kotlin/Compose Multiplatform, com framework Kotlin e host SwiftUI. O caminho
usado neste projeto foi **xcross 2.1.3, com ajustes locais**, diretamente no
Windows x64. Não foi necessário executar macOS, instalar Xcode como aplicativo,
usar WSL ou combinar xtool com xcross para compilar o SobraAi.

O arquivo completo do Xcode foi usado somente como entrada para extrair o SDK
Apple. A interface continuou sendo a mesma implementação Compose compartilhada
com o Android; não criamos uma versão simplificada para iPhone.

Fluxo efetivo:

```text
Fontes Kotlin comuns + Gradle → KLIB → framework iOS ARM64
Framework + host SwiftUI + recursos → SobraAi.app
Conta Apple gratuita → certificado/perfil → assinatura → instalação USB
```

O Projeto BI teve sua compilação tratada em outro projeto/chat. Aqui registramos
o IPA que foi localizado e preparado, sem atribuir a ele os comandos KMP do SobraAi.

## 2. O que precisa instalar ou obter

| Item | Versão/uso nesta execução |
| --- | --- |
| Windows x64, PowerShell e Git | Ambiente de desenvolvimento e aplicação do patch |
| Android Studio, JDK e SDK Android | Ambiente Gradle existente; Java em `C:\Program Files\Android\Android Studio\jbr` |
| Visual Studio Build Tools 2022 | Ferramentas C++ MSVC e Windows SDK necessários ao Swift no Windows |
| Swift para Windows | **6.4.3**, toolchain em `6.4.3+Asserts` |
| LLVM para Windows | **23.1.6**, incluindo clang e linker Darwin `ld64.lld` |
| Dart SDK | Para recompilar o xcross modificado e executar o instalador auxiliar; o pacote xcross 2.1.3 exige Dart `^3.10.0` |
| xcross | **2.1.3**, com os quatro ajustes preservados junto deste guia |
| Kotlin/Native | **2.4.21**, preparado pelo fluxo Compose em cache isolado |
| Python 3 + pymobiledevice3 | Comunicação com o iPhone; pymobiledevice3 **11.63.1** em ambiente virtual |
| Drivers Apple para USB | Foi necessário instalar o suporte Apple; iTunes desktop **12.13.12.3** e Apple Devices estavam presentes ao final |
| Xcode completo em `.xip` | Baixado pela conta Apple; arquivo usado: `Xcode_27.xip` |
| Conta Apple secundária gratuita | Login local, com verificação em duas etapas quando solicitada |
| iPhone, cabo USB de dados e internet | Aparelho desbloqueado e autorizado a confiar no PC |
| Sideloadly | **Opcional**; versão instalada **0.72**, apenas na tentativa posterior de renovação |

Fontes para obter as ferramentas: [Android Studio](https://developer.android.com/studio),
[Build Tools da Microsoft](https://visualstudio.microsoft.com/downloads/),
[Swift](https://www.swift.org/install/windows/), [LLVM](https://github.com/llvm/llvm-project/releases),
[Dart](https://dart.dev/get-dart), [Python](https://www.python.org/downloads/windows/),
[pymobiledevice3](https://github.com/doronz88/pymobiledevice3) e
[xcross v2.1.3](https://github.com/arxdeus/xcross/releases/tag/v2.1.3).

O `xcross setup` oferece instalação de dependências do host. Confira o que ele
propõe antes de executar: uma versão atual pode instalar versões diferentes das
registradas aqui. Flutter não faz parte do código do SobraAi e não foi a base
deste build Compose.

### Qual Xcode baixar

Entre em [Apple Developer Downloads](https://developer.apple.com/download/all/),
busque Xcode e baixe o **arquivo completo `.xip`**, equivalente à versão usada
neste registro. Não basta baixar Command Line Tools, uma imagem de simulador ou
um componente isolado. A conta Apple é necessária para acessar o download.

Neste PC o arquivo ficou em:

```text
C:\Users\kaiqu\Downloads\Xcode_27.xip
```

O SDK é extraído localmente; Xcode/macOS não são executados. Reserve espaço para
o arquivo grande, a extração, toolchains e caches. Não coloque o SDK Apple no Git
nem o redistribua. O SDK preparado fica vinculado à toolchain Swift escolhida;
se trocar o Swift, refaça `xcross sdk install`.

## 3. Arquivos que agora acompanham o guia

Na pasta [windows-ios](windows-ios/) ficaram preservados:

- [xcross-2.1.3-sobraai.patch](windows-ios/xcross-2.1.3-sobraai.patch): patch com caminhos relativos, aplicável ao código-fonte original v2.1.3.
- [Invoke-SobraAiIosBuild.ps1.txt](windows-ios/Invoke-SobraAiIosBuild.ps1.txt): script de doctor/setup/build que foi utilizado.
- [config.yaml.txt](windows-ios/config.yaml.txt): seleção de Swift, LLVM, Java e cache Kotlin/Native.
- [Authenticate-Apple.ps1.txt](windows-ios/Authenticate-Apple.ps1.txt): comando interativo de autenticação.
- [Install-SobraAi.dart.txt](windows-ios/Install-SobraAi.dart.txt): instalador USB usado, sem abrir automaticamente o app.

Os quatro arquivos `.txt` são **modelos históricos**, com os caminhos desta
máquina. Copie para uma pasta local de ferramentas, retire apenas a extensão
`.txt` e ajuste os caminhos antes de executar em outro PC. Não são uma instalação
portátil pronta. Nenhum deles contém senha, token ou chave privada.

Não copie caches de autenticação para dentro do projeto. Binários, SDKs, IPAs,
certificados e chaves também não foram adicionados à documentação.

## 4. Preparar o ambiente em outro PC

### 4.1 Projeto e configurações privadas

Obtenha o projeto e leia [AGENTS.md](../AGENTS.md), [rules.md](../rules.md) e
[a integração iOS](kmp-compose-ios.md). Trabalhe na `main`, preservando alterações.
Instale as ferramentas da tabela e abra um terminal novo para atualizar o PATH.
Na raiz do projeto, configure `local.properties` com SDK Android e a API real
HTTPS, conforme o [fluxo de trabalho](ai-workflow.md).

Copie `iosApp/Configuration/Local.xcconfig.example` como
`iosApp/Configuration/Local.xcconfig`, ignorado no Git. Configure ali a mesma API
HTTPS usada pelo Android. Em `.xcconfig`, o formato é:

```text
API_BASE_URL = https:/$()/SEU_HOST_REAL/
```

Substitua o marcador pela configuração real localmente. `$()` evita que `//`
seja interpretado como comentário pelo parser de xcconfig. Não gere um app de
uso real apontando para `example.invalid` e não salve configurações privadas no guia.

### 4.2 Organização local de ferramentas

Nesta máquina usamos:

```text
C:\Users\kaiqu\AppData\Local\SobraAiTools\
  xcross-2.1.3-sobraai\
  konan\
  device-tools\
  install-state\
  sideloadly-setup\
  Sideloadly\
```

No novo PC prefira montar a raiz com `$env:LOCALAPPDATA`, sem assumir o usuário
`kaiqu`. Exemplo para preparar a comunicação USB:

```powershell
$toolRoot = Join-Path $env:LOCALAPPDATA 'SobraAiTools'
python -m venv (Join-Path $toolRoot 'device-tools')
$devicePython = Join-Path $toolRoot 'device-tools\Scripts\python.exe'
& $devicePython -m pip install 'pymobiledevice3==11.63.1'
$env:PATH = (Join-Path $toolRoot 'device-tools\Scripts') + ';' + $env:PATH
```

Instale os drivers Apple e conecte o telefone. O iTunes/Apple Devices deve
reconhecê-lo. No iPhone desbloqueado, aceite **Confiar neste computador** e informe
o código do aparelho se solicitado. O Python sozinho não substitui os drivers USB.

### 4.3 Reconstituir o xcross com os ajustes

Use o código-fonte **v2.1.3**, não aplique o patch cegamente à versão mais nova.
Extraia o código em uma pasta de ferramentas fora deste repositório. Na raiz
extraída do xcross, execute, ajustando o caminho para o projeto:

```powershell
git apply --check 'CAMINHO_DO_PROJETO\docs\windows-ios\xcross-2.1.3-sobraai.patch'
git apply 'CAMINHO_DO_PROJETO\docs\windows-ios\xcross-2.1.3-sobraai.patch'
dart pub get
```

O patch preserva estes ajustes feitos durante a tentativa:

1. Normaliza caminhos Windows com prefixo `\\?\` na descoberta de fontes Swift.
2. Prioriza o host SwiftUI explícito do projeto, mesmo havendo uma entrada Kotlin.
   Isso evita selecionar um host gerado que perderia a integração nativa existente.
3. Lê `Base.xcconfig` quando não existe `Config.xcconfig` e resolve os includes,
   inclusive o `Local.xcconfig`, com proteção contra ciclos.
4. Acrescenta os hashes SHA-256 dos artefatos Kotlin/Native **2.4.21** Windows e
   macOS x64 exigidos pelo preparo da compilação cruzada.

Para produzir o executável a partir do pacote modificado, a entrada é
`packages/xcross/bin/xcross.dart`. Uma forma de recompilar, a partir da raiz do
código-fonte com dependências resolvidas, é:

```powershell
dart compile exe packages/xcross/bin/xcross.dart -o CAMINHO_DAS_FERRAMENTAS\xcross-2.1.3-sobraai\bin\xcross.exe
```

Crie a pasta de destino antes. Mantenha também os arquivos auxiliares da
distribuição oficial da mesma versão, como `lib` e o alias `xcrun.exe`; o exe
isolado não deve ser tratado como todo o ambiente. Os comandos desta seção são
o roteiro de reconstrução; o resultado ainda precisa passar pelo doctor/build
no novo PC. O ambiente original usou uma distribuição local recompilada.

### 4.4 Configurar os caminhos e extrair o SDK

Copie/adapte `config.yaml.txt` e os scripts históricos. No script de build,
ajuste `$projectRoot`, `JAVA_HOME`, Swift, LLVM e `XCROSS_KONAN_DATA_DIR`.
No `config.yaml`, ajuste `toolchains.swift`, `toolchains.llvm`, `roots.javaHome`
e `roots.konanData`. Use o cache isolado para não misturar com outras instalações.

No PowerShell, aponte para o xcross modificado e a configuração adaptada:

```powershell
$xcross = 'CAMINHO_DAS_FERRAMENTAS\xcross-2.1.3-sobraai\bin\xcross.exe'
$env:XCROSS_CONFIG = 'CAMINHO_DAS_FERRAMENTAS\xcross-2.1.3-sobraai\config.yaml'
# Swift, LLVM, Java e pymobiledevice3 precisam estar acessíveis neste terminal.
& $xcross sdk install 'CAMINHO_DO_DOWNLOAD\Xcode_27.xip'
```

Escolha o Swift antes da extração. Em seguida, na raiz do SobraAi, use o script
adaptado para configurar e verificar o suporte Compose:

```powershell
& 'CAMINHO_DAS_FERRAMENTAS\xcross-2.1.3-sobraai\Invoke-SobraAiIosBuild.ps1' -Mode setup
& 'CAMINHO_DAS_FERRAMENTAS\xcross-2.1.3-sobraai\Invoke-SobraAiIosBuild.ps1' -Mode doctor
```

Resolva dependências ausentes antes de prosseguir. Não remova targets iOS nem
altere as telas Android para contornar falhas do ambiente.

## 5. Compilar o SobraAi

Com o ambiente preparado, usamos estes comandos nesta máquina:

```powershell
& 'C:\Users\kaiqu\AppData\Local\SobraAiTools\xcross-2.1.3-sobraai\Invoke-SobraAiIosBuild.ps1' -Mode build -Framework
& 'C:\Users\kaiqu\AppData\Local\SobraAiTools\xcross-2.1.3-sobraai\Invoke-SobraAiIosBuild.ps1' -Mode build
```

No novo PC use os caminhos adaptados. O primeiro comando gera o framework; o
segundo reaproveita esse resultado e monta o app com host SwiftUI e recursos.
O primeiro link nativo demorou vários minutos; atividade de Java/LLVM/clang não
significou travamento.

### Outro ajuste necessário: Info.plist

O xcross 2.1.3 procurava `iosApp/Info.plist`, enquanto o arquivo canônico é
`iosApp/SobraAi/Info.plist`. O script preservado copia temporariamente o canônico
para o caminho esperado somente durante a montagem. Ele não sobrescreve um
arquivo já existente e remove apenas a cópia que criou, em `finally`.

Não mantenha duas versões divergentes do plist. Esse cuidado preservou a API e
as permissões de Face ID, fotos, microfone e reconhecimento de fala.

### Saídas geradas

```text
..\build\xcross-ios\SobraAiUI.framework
..\build\xcross-ios\SobraAi.app
```

Foram conferidos o binário Mach-O ARM64, a exportação da classe `IosApp`, a API
configurada, as permissões e as cinco fontes Roboto incluídas. Essas verificações
não substituem os testes de interface e de fluxos no aparelho.

## 6. Assinar e instalar por USB: procedimento que funcionou

### 6.1 Preparar o iPhone

1. Conecte por cabo de dados, desbloqueie e confirme a confiança no PC.
2. Ative **Ajustes → Privacidade e Segurança → Modo de Desenvolvedor**, se ainda
   estiver desativado; conclua o reinício/confirmação solicitado pelo iOS.
3. Verifique o limite de apps gratuitos. Durante esta instalação o limite de
   três apps foi atingido. O usuário removeu um app dispensável para liberar vaga.
   Não remova o SobraAi existente só para renovar a assinatura.

### 6.2 Autenticação Apple

Execute localmente, com o xcross modificado e as ferramentas no PATH:

```powershell
& $xcross auth
```

Use a conta Apple secundária escolhida e conclua senha/2FA diretamente no
terminal interativo. O modelo `Authenticate-Apple.ps1.txt` registra esse comando.
Não envie credenciais pelo chat nem as coloque no Git.

### 6.3 Certificados: atenção ao mudar de computador

Na primeira tentativa, o assinador encontrou um certificado existente cuja chave
privada não estava disponível localmente e o revogou antes de emitir outro.
Isso pode invalidar outros apps assinados por aquele certificado. Depois, o
Projeto BI reutilizou a identidade atual para evitar outra revogação.

Em outro PC, **não presuma que fazer login recupera a chave privada**. Antes de
substituir certificados, confira o estado da conta e dos outros apps. Se precisar
migrar certificado/chave, faça backup privado e transferência segura fora do
repositório. Se não for possível reutilizar a identidade, planeje reassinar todos
os apps afetados. Não confirme uma revogação como se fosse um passo sem efeito.

### 6.4 Instalação sem abertura automática

Foi utilizado o auxiliar Dart preservado em `Install-SobraAi.dart.txt`. Ele:

- carrega o contexto nativo do xcross;
- seleciona o iPhone via USB;
- assina/provisiona e instala `build/xcross-ios/SobraAi.app`;
- grava o identificador instalado e a referência do aparelho em `install-state`;
- termina com `INSTALL_COMPLETED` quando não há erro.

Copie o modelo como `Install-SobraAi.dart` para a pasta de ferramentas e ajuste
os caminhos absolutos do `.app` e de `install-state`. Ele depende das APIs internas
da versão **2.1.3**. Execute usando a configuração de pacotes resolvida no
código-fonte do xcross, por exemplo:

```powershell
dart --packages='CAMINHO_FONTE_XCROSS\.dart_tool\package_config.json' 'CAMINHO_DAS_FERRAMENTAS\xcross-2.1.3-sobraai\Install-SobraAi.dart'
```

O helper foi escolhido para instalar sem iniciar automaticamente o app nem uma
sessão de depuração. Não é necessário tratar `xcross compose run` como sinônimo
de instalação: esse outro fluxo também envolve execução e túnel de desenvolvimento.

### 6.5 Erro de integridade que apareceu

O ícone apareceu na tela inicial, mas o iPhone informou que não podia instalar
porque a integridade não podia ser verificada. Conferimos o estado em:

**Ajustes → Geral → VPN e Gerenciamento de Dispositivo → perfil da conta usada.**

Após concluir a confiança/verificação do perfil no aparelho, o usuário confirmou:
**“Instalou perfeito e funcionou tudo”.** Esse foi o desfecho desta ocorrência;
outros erros semelhantes podem exigir conferir validade, assinatura e perfil,
não apenas repetir a confiança.

## 7. Identidade dos apps e arquivos preparados

O identificador original do projeto iOS SobraAi é `br.com.sobraai.app.ios`.
Na assinatura gratuita o xcross gerou um identificador instalado com prefixo.
O helper preserva a chamada original; o assinador resolve o identificador efetivo.

| App | Bundle ID instalado nesta conta |
| --- | --- |
| SobraAi | `XCR-8F5M6S59D3.br.com.sobraai.app.ios` |
| Projeto BI | `XTL-8F5M6S59D3.com.example.app` |

Esses valores registram esta conta/equipe, não são universais para outra conta.
Para atualizar a instalação atual, preserve a conta, a identidade do app e os
entitlements aplicáveis. Trocar identidade pode gerar outro app e perder acesso
à sessão/Keychain existente. Não apague a instalação antiga para tentar atualizar.

### IPAs preparados neste PC

```text
SobraAi:
C:\Users\kaiqu\AppData\Local\SobraAiTools\sideloadly-setup\SobraAi-current.ipa

Projeto BI:
C:\Users\kaiqu\AppData\Local\SobraAiTools\sideloadly-setup\ProjetoBI-current.ipa
```

O IPA do SobraAi foi empacotado a partir do `.app` já assinado e funcional, como
ZIP com `Payload/SobraAi.app/`, preservando o executável. Conferimos a integridade
do ZIP e que o bundle ID correspondia ao app instalado. Renomear uma pasta `.app`
para `.ipa` não faz esse empacotamento.

O IPA do BI foi copiado da versão com correção de UIScene que estava em:

```text
C:\Users\kaiqu\Desktop\Projetos\graphics-bi-frontend\build\ios-xtool\GraphicsBI-experimental-2026-11-23.ipa
```

Esses arquivos estão fora do Git. Copie-os separadamente se quiser usar os
artefatos existentes em outro PC. A assinatura contida neles expira; ter uma
cópia do IPA não elimina a necessidade de reassinar. Para reconstruir uma versão
nova do BI, consulte o projeto dele, não execute os comandos Gradle deste guia.

## 8. Validade e renovação

Com a conta gratuita usada, o perfil tem validade de **sete dias**. O perfil
original desta instalação indicava **30/11/2026 às 10h20, horário de Brasília**.
Essa é uma data histórica: uma nova assinatura terá outra validade.

Ao vencer, o app permanece instalado, mas deixa de abrir. Reassine e instale
novamente preservando a identidade. O vencimento não é uma desinstalação nem
uma exclusão automática dos dados salvos no servidor.

### Tentativa opcional de renovação automática: não concluída

Depois da instalação funcional, preparamos os IPAs e instalamos o Sideloadly
0.72 em:

```text
C:\Users\kaiqu\AppData\Local\SobraAiTools\Sideloadly\sideloadly.exe
```

O instalador veio do site oficial, mas não tinha assinatura digital de publicador
do Windows. A execução inicialmente foi bloqueada pela revisão automática e
prosseguiu somente após autorização explícita do usuário para esse instalador.
Isso é um registro do arquivo daquela ocasião, não uma garantia sobre downloads futuros.

A configuração da interface foi interrompida. **Não foi habilitada nem validada
a renovação automática de nenhum dos dois apps.** Depois, o usuário decidiu
deixar essa alternativa de lado. Sideloadly não foi o meio que instalou o SobraAi
na tentativa bem-sucedida descrita na seção 6.

Caso queira retomar futuramente, o procedimento proposto é selecionar o IPA,
usar a mesma conta Apple, habilitar Automatic Refresh e preservar os bundle IDs
da seção 7, desativando a geração automática de identificadores quando necessário.
Após concluir a instalação, os dois apps precisam aparecer cadastrados no daemon.
Se houver solicitação de revogação de certificados, confira o impacto antes de aceitar.

Sem cabo, o fluxo exige sincronização Wi-Fi configurada, PC acordado com o daemon
ativo e iPhone detectável na mesma rede. A orientação do Sideloadly no Windows é
conectar inicialmente por USB e ativar no iTunes: **iPhone → Resumo → Opções →
Sincronizar com este iPhone via Wi-Fi → Aplicar/Sincronizar**. Não renova com o PC
desligado ou sem contato com o telefone. A automação mantém a assinatura gratuita
renovada; não remove o prazo de sete dias. [FAQ do Sideloadly](https://sideloadly.io/faq.html).

## 9. Diagnóstico rápido

| Sintoma | O que conferir |
| --- | --- |
| iPhone não aparece por USB | Cabo de dados, aparelho desbloqueado, confiança no PC e drivers Apple; reconhecimento no iTunes/Apple Devices |
| Swift ou LLVM ausente | Instalação completa, MSVC/Windows SDK, PATH atualizado e caminhos no YAML/script |
| SDK incompatível após trocar Swift | Recriar o SDK com `xcross sdk install` usando a toolchain escolhida |
| Host SwiftUI não é descoberto | Versão e aplicação do patch de normalização/priorização; não substituir as telas por um host simplificado |
| API ausente/incorreta no pacote | `Base.xcconfig`, includes de `Local.xcconfig`, patch e staging temporário do plist |
| Preparo Kotlin/Native rejeita artefato 2.4.21 | Patch dos hashes e versão/cache isolado; não desativar validação de hash |
| Limite de apps gratuitos | Conferir os três apps permitidos; remover apenas app dispensável escolhido pelo usuário |
| App duplicado em vez de atualizado | Conta e bundle ID diferentes; conferir antes de instalar novamente |
| Integridade/verificação no iPhone | Perfil confiável, modo de desenvolvedor, assinatura/perfil válidos e internet para verificação |
| Outros apps deixam de abrir após assinatura | Possível revogação de certificado compartilhado; conferir e reassinar os afetados |
| Compilação demorada | Primeiro link nativo é custoso; observar atividade e logs antes de concluir que travou |

## 10. O que foi validado e o que repetir no PC novo

Nesta execução houve build do framework ARM64 e do app completo no Windows,
conferência dos recursos/configuração, assinatura e instalação USB. O usuário
confirmou a execução real no iPhone. Os testes locais dos ajustes da ferramenta
terminaram com **32 testes aprovados**; isso não é o harness completo do SobraAi
nem prova comparação visual exaustiva Android/iOS.

Este registro não declara nova execução de `harnessVerify`, build Xcode no Mac
ou testes Native em simulador. Para mudanças no código do app, siga o
[fluxo de validação](ai-workflow.md), preservando Android e iOS.

No outro PC, conclua cada marco antes do seguinte:

1. Ferramentas detectadas e SDK extraído com o Swift correto.
2. Patch aplicado à v2.1.3 e doctor sem impedimentos relevantes.
3. Framework e app completos compilados, com API/permissões/recursos conferidos.
4. Conta/certificados revisados, iPhone reconhecido e instalação concluída.
5. Perfil confiável e abertura/fluxos testados pelo usuário no iPhone.
6. Registrar validade e forma de renovar, sem presumir automação configurada.

## Referências

- [xcross: Compose Multiplatform](https://xcross.sh/docs/compose/)
- [Código-fonte xcross v2.1.3](https://github.com/arxdeus/xcross/tree/v2.1.3)
- [Apple Developer: downloads completos](https://developer.apple.com/download/all/)
- [Apple: recursos e limites da conta](https://developer.apple.com/help/account/basics/about-your-developer-account/)
- [Apple: Modo de Desenvolvedor](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device)
- [Sideloadly: instalação e dúvidas](https://sideloadly.io/faq.html)
- [Integração KMP/Compose iOS deste projeto](kmp-compose-ios.md)
