import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { PersonaKind } from '@corporate-blabla/core';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { getPersonas, upsertPersona, deletePersona, type Persona } from '@/lib/personas';
import { PaperCard, Button } from '@/components/ui';

export default function Personas() {
  const t = useTheme();
  const router = useRouter();
  const { locale } = useUser();
  const s = tr(locale);

  const [list, setList] = useState<Persona[]>([]);
  const [editing, setEditing] = useState<Persona | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<PersonaKind>('recipient');
  const [samplesText, setSamplesText] = useState('');

  useEffect(() => {
    getPersonas().then(setList);
  }, []);

  function startNew() {
    setEditing({ id: '', name: '', kind: 'recipient', samples: [] });
    setName('');
    setKind('recipient');
    setSamplesText('');
  }
  function startEdit(p: Persona) {
    setEditing(p);
    setName(p.name);
    setKind(p.kind);
    setSamplesText(p.samples.join('\n'));
  }

  async function save() {
    const samples = samplesText.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 5);
    if (!name.trim() || samples.length === 0) return;
    const next = await upsertPersona({
      id: editing?.id || undefined,
      name: name.trim(),
      kind,
      samples,
    });
    setList(next);
    setEditing(null);
  }

  async function remove(id: string) {
    Alert.alert(s('persona_delete'), '', [
      { text: locale === 'tr' ? 'Vazgeç' : 'Cancel', style: 'cancel' },
      { text: s('persona_delete'), style: 'destructive', onPress: async () => setList(await deletePersona(id)) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={t.text} />
        </Pressable>
        <Text style={{ fontFamily: font.serif, fontSize: 22, color: t.textStrong }}>{s('personas_title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, paddingBottom: 40 }}>
        {!editing ? (
          <>
            <Text style={{ fontSize: 13, color: t.textSoft, lineHeight: 20, marginBottom: 16 }}>
              {s('personas_intro')}
            </Text>

            {list.length === 0 && (
              <Text style={{ color: t.muted, marginVertical: 24, textAlign: 'center' }}>{s('personas_empty')}</Text>
            )}

            {list.map((p) => (
              <PaperCard key={p.id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: font.serif, fontSize: 17, color: t.textStrong }}>{p.name}</Text>
                    <Text style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>
                      {p.kind === 'self' ? s('persona_kind_self') : s('persona_kind_recipient')} · {p.samples.length} {locale === 'tr' ? 'örnek' : 'samples'}
                    </Text>
                  </View>
                  <Pressable onPress={() => startEdit(p)} hitSlop={8} style={{ padding: 6 }}>
                    <Ionicons name="create-outline" size={20} color={t.muted} />
                  </Pressable>
                  <Pressable onPress={() => remove(p.id)} hitSlop={8} style={{ padding: 6 }}>
                    <Ionicons name="trash-outline" size={19} color={t.accent} />
                  </Pressable>
                </View>
              </PaperCard>
            ))}

            <View style={{ marginTop: 8 }}>
              <Button label={s('persona_add')} variant="solid" onPress={startNew} />
            </View>
          </>
        ) : (
          <View>
            <Text style={labelStyle(t)}>{s('persona_name')}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={s('persona_name')}
              placeholderTextColor={t.muted}
              accessibilityLabel={s('persona_name')}
              style={inputStyle(t)}
            />

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              {(['recipient', 'self'] as PersonaKind[]).map((k) => {
                const active = kind === k;
                return (
                  <Pressable
                    key={k}
                    onPress={() => setKind(k)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: radius.md,
                      alignItems: 'center',
                      backgroundColor: active ? t.accent : t.surfaceAlt,
                      borderWidth: 0.5,
                      borderColor: active ? t.accent : t.line,
                    }}
                  >
                    <Text style={{ color: active ? t.bg : t.text, fontSize: 13, fontWeight: active ? '500' : '400' }}>
                      {k === 'self' ? s('persona_kind_self') : s('persona_kind_recipient')}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[labelStyle(t), { marginTop: 18 }]}>{s('persona_samples')}</Text>
            <TextInput
              value={samplesText}
              onChangeText={setSamplesText}
              placeholder={"Rica etsem bugün halledelim.\nBilginize.\nÖnceki mailimde belirttiğim üzere…"}
              placeholderTextColor={t.muted}
              accessibilityLabel={s('persona_samples')}
              multiline
              style={[inputStyle(t), { minHeight: 120, textAlignVertical: 'top' }]}
            />

            <View style={{ flexDirection: 'row', gap: 9, marginTop: 18 }}>
              <View style={{ flex: 1 }}>
                <Button label={locale === 'tr' ? 'Vazgeç' : 'Cancel'} variant="ghost" onPress={() => setEditing(null)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label={s('persona_save')} variant="accent" onPress={save} disabled={!name.trim() || !samplesText.trim()} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function labelStyle(t: ReturnType<typeof useTheme>) {
  return { fontSize: 11, letterSpacing: 1.5, color: t.muted, textTransform: 'uppercase' as const };
}
function inputStyle(t: ReturnType<typeof useTheme>) {
  return {
    marginTop: 7,
    backgroundColor: t.surfaceAlt,
    borderColor: t.line,
    borderWidth: 0.5,
    borderRadius: radius.md,
    padding: 12,
    fontSize: 15,
    color: t.text,
  };
}
