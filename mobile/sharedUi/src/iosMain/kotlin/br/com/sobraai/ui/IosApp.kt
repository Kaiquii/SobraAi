@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)

package br.com.sobraai.ui

import androidx.compose.ui.window.ComposeUIViewController
import com.example.appfinanceiro.core.data.*
import com.example.appfinanceiro.core.network.*
import com.example.appfinanceiro.core.network.auth.KtorAuthApi
import kotlinx.coroutines.*
import platform.LocalAuthentication.*
import platform.UIKit.UIApplication
import platform.UIKit.UIApplicationState.UIApplicationStateActive
import platform.UIKit.UIViewController
import kotlin.coroutines.resume

/** The Swift host owns exactly one instance, including its Keychain store and HTTP client. */
class IosApp(apiBaseUrl: String, sessionService: String) {
    private val scope = MainScope()
    private val client = lazy(::createPlatformHttpClient)
    private val configuration = ApiConfiguration(apiBaseUrl)
    private val transport = ApiTransport(client, configuration)
    private val authApi = KtorAuthApi(transport)
    private val auth = SharedAuthRepository(authApi)
    private val finance = SharedFinanceRepository(KtorFinanceApi(transport))
    private val session = IosSessionStore(sessionService)
    private val native = IosNativeFeatures()
    private val files = KtorFinanceFiles(client, configuration)
    private val biometrics = AppleBiometrics()
    private var sceneActive = false
    private val controller = AppController(auth::login, session, biometrics, scope,
        canRevealUnlockedSession = { sceneActive && UIApplication.sharedApplication.applicationState == UIApplicationStateActive })
    private val patrimony = SharedPatrimonyRepository(transport)
    private val services = br.com.sobraai.ui.runtime.UiServices(session, finance, auth, files, native, controller,
        IosReportFiles(files, native), apiBaseUrl, codeDeliveryAvailable = false, patrimony = patrimony, investmentCategories = patrimony)

    fun viewController(): UIViewController = ComposeUIViewController {
        SobraAiApp(services)
    }.also { native.host = it }

    fun enterBackground() {
        sceneActive = false
        native.cancelInteractions()
        controller.enterBackground()
    }
    fun enterInactive() { sceneActive = false }
    fun enterForeground() {
        sceneActive = true
        controller.enterForeground()
    }
    fun canKeepStartupLoginVisible() = controller.canKeepStartupLoginVisible()
    fun close() {
        native.cancelInteractions()
        scope.cancel()
        if (client.isInitialized()) client.value.close()
    }
}

private class AppleBiometrics : BiometricAuthenticator {
    override fun isAvailable(): Boolean = LAContext().canEvaluatePolicy(LAPolicyDeviceOwnerAuthenticationWithBiometrics, null)

    override fun kind(): BiometricKind {
        val context = LAContext()
        // LocalAuthentication populates biometryType after evaluating availability.
        context.canEvaluatePolicy(LAPolicyDeviceOwnerAuthenticationWithBiometrics, null)
        return when (context.biometryType) {
            LABiometryTypeFaceID -> BiometricKind.FaceId
            LABiometryTypeTouchID -> BiometricKind.TouchId
            else -> BiometricKind.Generic
        }
    }

    override suspend fun authenticate(): Boolean = withContext(Dispatchers.Main) {
        suspendCancellableCoroutine { continuation ->
            val context = LAContext()
            if (!context.canEvaluatePolicy(LAPolicyDeviceOwnerAuthenticationWithBiometrics, null)) {
                continuation.resume(false)
            } else {
                continuation.invokeOnCancellation { context.invalidate() }
                context.evaluatePolicy(LAPolicyDeviceOwnerAuthenticationWithBiometrics,
                    localizedReason = "Desbloqueie o SobraAi para acessar sua conta.") { accepted, _ ->
                    if (continuation.isActive) continuation.resume(accepted)
                }
            }
        }
    }
}
