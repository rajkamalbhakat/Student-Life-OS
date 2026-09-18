package in.rajkamal.orbit;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.webkit.*;
import android.widget.*;
import android.view.ViewGroup;
import org.json.JSONObject;
import java.util.ArrayList;

/** Online Android client. No API keys or local user databases are bundled. */
public class MainActivity extends Activity {
    private WebView web;
    private String origin;
    private ValueCallback<Uri[]> fileCallback;
    private static final int FILE_REQUEST = 10, VOICE_REQUEST = 11;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom());
            return insets;
        });
        LinearLayout bar = new LinearLayout(this);
        Button settings = new Button(this); settings.setText("Website"); bar.addView(settings);
        Button reload = new Button(this); reload.setText("Reload"); bar.addView(reload);
        Button voice = new Button(this); voice.setText("Dictate"); bar.addView(voice);
        layout.addView(bar);
        web = new WebView(this);
        layout.addView(web, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1));
        TextView credit = new TextView(this); credit.setText("Built by Rajkamal"); credit.setGravity(17);
        layout.addView(credit); setContentView(layout);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false); s.setAllowContentAccess(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (isOwnOrigin(u)) return false;
                if ("https".equals(u.getScheme())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, u)); }
                    catch (Exception e) { toast("No browser available"); }
                }
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError error) {
                if (req.isForMainFrame()) toast("Cannot reach your website. Check its address and internet connection.");
            }
            @Override public void onPageFinished(WebView view, String url) { CookieManager.getInstance().flush(); }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                i.setType("*/*"); i.addCategory(Intent.CATEGORY_OPENABLE);
                i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == FileChooserParams.MODE_OPEN_MULTIPLE);
                try { startActivityForResult(i, FILE_REQUEST); }
                catch (Exception e) { fileCallback.onReceiveValue(null); fileCallback = null; toast("File picker unavailable"); }
                return true;
            }
        });
        web.setDownloadListener((url, agent, disposition, mime, length) -> toast("Use your phone browser for exports in this test version."));
        settings.setOnClickListener(v -> configure());
        reload.setOnClickListener(v -> web.reload());
        voice.setOnClickListener(v -> {
            if (!isOwnOrigin(Uri.parse(web.getUrl() == null ? "" : web.getUrl()))) return;
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN");
            i.putExtra(RecognizerIntent.EXTRA_PROMPT, "Say an Orbit command; review it before running.");
            try { startActivityForResult(i, VOICE_REQUEST); }
            catch (Exception e) { toast("Speech service unavailable. Type in the app's voice assistant instead."); }
        });
        origin = getPreferences(MODE_PRIVATE).getString("origin", "");
        if (origin.isEmpty()) configure(); else web.loadUrl(origin);
    }
    private boolean isOwnOrigin(Uri u) {
        if (origin == null || origin.isEmpty()) return false;
        Uri expected = Uri.parse(origin);
        return "https".equals(u.getScheme()) && expected.getHost() != null && expected.getHost().equalsIgnoreCase(u.getHost())
            && (u.getPort() == -1 ? 443 : u.getPort()) == (expected.getPort() == -1 ? 443 : expected.getPort());
    }
    private void configure() {
        EditText input = new EditText(this);
        input.setSingleLine(true); input.setHint("https://your-project.vercel.app"); input.setText(origin);
        AlertDialog d = new AlertDialog.Builder(this).setTitle("Connect your Orbit website")
            .setMessage("Enter the HTTPS address of your deployed Orbit application. A GitHub repository address will not work.")
            .setView(input).setPositiveButton("Connect", null).setNegativeButton("Cancel", null).create();
        d.setOnShowListener(x -> d.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String value = input.getText().toString().trim(); Uri u = Uri.parse(value);
            if (!"https".equals(u.getScheme()) || u.getHost() == null || u.getUserInfo() != null
                || u.getQuery() != null || u.getFragment() != null || !(u.getPath().isEmpty() || u.getPath().equals("/"))) {
                input.setError("Enter an HTTPS website origin without a path or query"); return;
            }
            origin = "https://" + u.getEncodedAuthority();
            getPreferences(MODE_PRIVATE).edit().putString("origin", origin).apply();
            web.loadUrl(origin); d.dismiss();
        })); d.show();
    }
    private void toast(String message) { Toast.makeText(this, message, Toast.LENGTH_LONG).show(); }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == FILE_REQUEST && fileCallback != null) {
            Uri[] files = null;
            if (result == RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    files = new Uri[data.getClipData().getItemCount()];
                    for (int n = 0; n < files.length; n++) files[n] = data.getClipData().getItemAt(n).getUri();
                } else if (data.getData() != null) files = new Uri[]{data.getData()};
            }
            fileCallback.onReceiveValue(files); fileCallback = null;
        }
        if (request == VOICE_REQUEST && result == RESULT_OK && data != null && isOwnOrigin(Uri.parse(web.getUrl() == null ? "" : web.getUrl()))) {
            ArrayList<String> words = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (words == null || words.isEmpty()) return;
            String quoted = JSONObject.quote(words.get(0));
            web.evaluateJavascript("(()=>{let el=document.getElementById('voice-command');if(!el){document.querySelector('[data-action=voice]')?.click();el=document.getElementById('voice-command');}if(el){el.value=" + quoted + ";return true;}return false;})()", value -> {
                if (!"true".equals(value)) toast("Sign in and open the voice assistant, then tap Dictate again.");
            });
        }
    }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() {
        if (fileCallback != null) { fileCallback.onReceiveValue(null); fileCallback = null; }
        web.destroy(); super.onDestroy();
    }
}
