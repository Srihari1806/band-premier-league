-- ============================================================
-- ENFORCE STRICT OWNER-ONLY SECURITY POLICIES
-- Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ==================== ARTIST APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_artist" ON artist_applications;
CREATE POLICY "auth_update_artist" ON artist_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );

-- ==================== BAND APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_band" ON band_applications;
CREATE POLICY "auth_update_band" ON band_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );

-- ==================== VENUE APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_venue" ON venue_applications;
CREATE POLICY "auth_update_venue" ON venue_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );

-- ==================== PRODUCTION HOUSE APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_prod_house" ON production_house_applications;
CREATE POLICY "auth_update_prod_house" ON production_house_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );

-- ==================== SPONSOR APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_sponsor" ON sponsor_applications;
CREATE POLICY "auth_update_sponsor" ON sponsor_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );

-- ==================== INFLUENCER APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_influencer" ON influencer_applications;
CREATE POLICY "auth_update_influencer" ON influencer_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );

-- ==================== VOLUNTEER APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_volunteer" ON volunteer_applications;
CREATE POLICY "auth_update_volunteer" ON volunteer_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );

-- ==================== EVENT MANAGER APPLICATIONS ====================
DROP POLICY IF EXISTS "auth_update_event_mgr" ON event_manager_applications;
CREATE POLICY "auth_update_event_mgr" ON event_manager_applications
  FOR UPDATE TO authenticated
  USING (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  )
  WITH CHECK (
    contact_email = auth.jwt()->>'email' 
    OR auth.jwt()->>'email' = 'organizer@bpl.com'
  );
