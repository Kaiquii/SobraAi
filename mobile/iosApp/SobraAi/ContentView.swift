import Combine
import SwiftUI
import UIKit
import SobraAiUI

private let startupBackground = UIColor(named: "StartupBackground") ?? .systemBackground

@MainActor
final class AppRuntime: ObservableObject {
    let app: IosApp?

    init() {
        let raw = Bundle.main.object(forInfoDictionaryKey: "ApiBaseURL") as? String ?? ""
        let parts = URLComponents(string: raw)
        if let parts, parts.scheme == "https", let host = parts.host, !host.isEmpty,
           parts.user == nil, parts.password == nil, parts.query == nil, parts.fragment == nil {
            app = IosApp(apiBaseUrl: raw, sessionService: Bundle.main.bundleIdentifier! + ".session")
        } else {
            app = nil
        }
    }
}

private struct ComposeView: UIViewControllerRepresentable {
    let runtime: IosApp
    func makeUIViewController(context: Context) -> UIViewController { runtime.viewController() }
    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}

@main
struct SobraAiApplication: App {
    @StateObject private var runtime = AppRuntime()
    @Environment(\.scenePhase) private var phase

    var body: some Scene {
        WindowGroup {
            ZStack {
                if let app = runtime.app {
                    ComposeView(runtime: app).ignoresSafeArea(.all)
                } else {
                    VStack(spacing: 16) {
                        Text("Configuração necessária").font(.title2)
                        Text("Configure o endereço HTTPS da API no projeto iOS para entrar no SobraAi.")
                    }.padding()
                }
                // The shared startup login has empty, disabled fields while Face ID is pending.
                if phase != .active && (phase != .inactive || runtime.app?.canKeepStartupLoginVisible() != true) {
                    Color(uiColor: startupBackground).ignoresSafeArea()
                    Image("StartupIcon")
                        .accessibilityLabel("Aplicativo protegido")
                }
            }
            .background(Color(uiColor: startupBackground).ignoresSafeArea())
            .onAppear {
                if phase == .active { runtime.app?.enterForeground() }
            }
            .onReceive(NotificationCenter.default.publisher(for: UIApplication.willResignActiveNotification)) { _ in
                runtime.app?.enterInactive()
            }
            .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
                if phase == .active { runtime.app?.enterForeground() }
            }
            .onChange(of: phase) { next in
                if next == .inactive { runtime.app?.enterInactive() }
                if next == .background { runtime.app?.enterBackground() }
                if next == .active { runtime.app?.enterForeground() }
            }
        }
    }
}
